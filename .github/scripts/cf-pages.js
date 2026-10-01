'use strict';
// Cloudflare Pages control for the ieatz project, run from the Actions runner
// because neither the pages pipeline sandbox nor the Cloudflare connector can
// reach the Pages API. Needs the CLOUDFLARE_API_TOKEN repo secret (Pages Edit).
//
//   CF_ACTION=inspect  print the project's production branch, the custom
//                      domains, and the last deployments with their
//                      environment (production or preview).
//   CF_ACTION=deploy   create a new production deployment from the
//                      production branch (same as Retry in the dashboard).
//   CF_ACTION=set-production-branch
//                      point the project's production branch at
//                      CF_PRODUCTION_BRANCH (default main), then deploy.
//   CF_ACTION=add-domain
//                      add CF_DOMAIN (default www.ieatzhealthy.com) as a
//                      custom domain on the project. Pages then validates it
//                      and issues its certificate; run inspect to watch the
//                      status go from pending to active.
//   CF_ACTION=fix-dns  point the zone's DNS record for CF_DOMAIN (default
//                      www.ieatzhealthy.com) at the project: a proxied CNAME
//                      to <project>.pages.dev, created or replaced. Needs the
//                      token to carry Zone > DNS > Edit for the zone as well;
//                      without it the API answers with a permission error
//                      and nothing changes.

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '5ad6af2a00cb0c3aa12ea9f2919524c9';
const PROJECT = process.env.CF_PAGES_PROJECT || 'ieatz';
const token = process.env.CLOUDFLARE_API_TOKEN;
const API = 'https://api.cloudflare.com/client/v4';
const base = `${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}`;

async function cfApi(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errs = (json.errors || []).map((e) => `${e.code}: ${e.message}`).join('; ');
    throw new Error(`Cloudflare API ${res.status} on ${url.replace(API, '')}: ${errs || 'no error body'}`);
  }
  return json.result;
}
const cf = (path, init) => cfApi(base + path, init);

async function fixDns(name) {
  const zoneName = name.split('.').slice(-2).join('.');
  const zones = await cfApi(`${API}/zones?name=${zoneName}`);
  if (!zones.length) throw new Error(`zone ${zoneName} not visible to this token (needs Zone > DNS > Edit on it)`);
  const zone = zones[0];
  const records = await cfApi(`${API}/zones/${zone.id}/dns_records?name=${name}`);
  const want = { type: 'CNAME', name, content: `${PROJECT}.pages.dev`, proxied: true, ttl: 1, comment: 'Cloudflare Pages project ' + PROJECT };
  for (const r of records) console.log(`current ${name}: ${r.type} -> ${r.content} proxied=${r.proxied} id=${r.id}`);
  const same = records.find((r) => r.type === 'CNAME' && r.content === want.content && r.proxied);
  if (same) { console.log(`${name} already points at ${want.content} (proxied); nothing to change`); return; }
  // One record for the host: replace the first, delete any others (an A/AAAA
  // pair from the old origin, for example).
  if (records.length) {
    const r = await cfApi(`${API}/zones/${zone.id}/dns_records/${records[0].id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(want) });
    console.log(`replaced ${name}: ${r.type} -> ${r.content} proxied=${r.proxied}`);
    for (const extra of records.slice(1)) { await cfApi(`${API}/zones/${zone.id}/dns_records/${extra.id}`, { method: 'DELETE' }); console.log(`deleted extra ${extra.type} record ${extra.id}`); }
  } else {
    const r = await cfApi(`${API}/zones/${zone.id}/dns_records`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(want) });
    console.log(`created ${name}: ${r.type} -> ${r.content} proxied=${r.proxied}`);
  }
}

function line(d) {
  const sha = (d.deployment_trigger && d.deployment_trigger.metadata && d.deployment_trigger.metadata.commit_hash || '').slice(0, 7);
  const branch = d.deployment_trigger && d.deployment_trigger.metadata && d.deployment_trigger.metadata.branch;
  const stage = d.latest_stage ? `${d.latest_stage.name}:${d.latest_stage.status}` : '?';
  return `${d.created_on}  ${d.environment.padEnd(10)}  ${sha || '(no sha)'}  ${branch || '-'}  ${stage}  ${d.url}`;
}

(async () => {
  if (!token) { console.log('CLOUDFLARE_API_TOKEN is not set as a repo secret; nothing to do.'); process.exit(2); }
  const action = process.env.CF_ACTION || 'inspect';
  const project = await cf('');
  console.log(`project ${project.name}: production_branch=${project.production_branch}, domains=${(project.domains || []).join(', ')}`);
  console.log(`source: ${project.source ? `${project.source.type} ${project.source.config && project.source.config.owner}/${project.source.config && project.source.config.repo_name} production_branch=${project.source.config && project.source.config.production_branch} production_deployments_enabled=${project.source.config && project.source.config.production_deployments_enabled} preview_deployment_setting=${project.source.config && project.source.config.preview_deployment_setting}` : 'none (direct upload)'}`);
  if (project.canonical_deployment) console.log(`canonical (production) deployment: ${line(project.canonical_deployment)}`);
  if (project.latest_deployment) console.log(`latest deployment:                ${line(project.latest_deployment)}`);
  const domains = await cf('/domains');
  console.log('custom domains:');
  for (const d of domains) {
    const v = d.validation_data || {}, ver = d.verification_data || {};
    console.log(`  ${d.name}  status=${d.status}  validation=${v.status || '-'}${v.error_message ? ` (${v.error_message})` : ''}  verification=${ver.status || '-'}${ver.error_message ? ` (${ver.error_message})` : ''}`);
  }
  const deployments = await cf('/deployments?per_page=10');
  console.log('recent deployments:');
  for (const d of deployments) console.log('  ' + line(d));
  let productionBranch = project.production_branch;
  if (action === 'set-production-branch') {
    const want = process.env.CF_PRODUCTION_BRANCH || 'main';
    if (productionBranch === want) console.log(`production branch is already ${want}`);
    else {
      const body = { production_branch: want };
      if (project.source) body.source = { type: project.source.type, config: { ...project.source.config, production_branch: want } };
      const updated = await cf('', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      console.log(`production branch changed: ${productionBranch} -> ${updated.production_branch}`);
      productionBranch = updated.production_branch;
    }
  }
  if (action === 'add-domain') {
    const name = process.env.CF_DOMAIN || 'www.ieatzhealthy.com';
    if (domains.some((d) => d.name === name)) console.log(`${name} is already a custom domain on the project`);
    else {
      const d = await cf('/domains', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
      console.log(`added ${name}: status=${d.status} validation=${JSON.stringify(d.validation_data || {})} verification=${JSON.stringify(d.verification_data || {})}`);
    }
  }
  if (action === 'fix-dns') {
    const name = process.env.CF_DOMAIN || 'www.ieatzhealthy.com';
    await fixDns(name);
    if (!domains.some((d) => d.name === name)) {
      const d = await cf('/domains', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
      console.log(`added ${name} to the project: status=${d.status}`);
    }
    const after = await cf('/domains');
    for (const d of after.filter((x) => x.name === name)) console.log(`${d.name} on the project: status=${d.status} validation=${(d.validation_data || {}).status || '-'} verification=${(d.verification_data || {}).status || '-'}`);
  }
  if (action === 'deploy' || action === 'set-production-branch') {
    const form = new FormData();
    form.set('branch', productionBranch);
    const d = await cf('/deployments', { method: 'POST', body: form });
    console.log(`created deployment: ${line(d)}`);
  }
})().catch((e) => { console.log(e.message); process.exit(1); });
