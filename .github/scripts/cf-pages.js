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

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '5ad6af2a00cb0c3aa12ea9f2919524c9';
const PROJECT = process.env.CF_PAGES_PROJECT || 'ieatz';
const token = process.env.CLOUDFLARE_API_TOKEN;
const base = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/pages/projects/${PROJECT}`;

async function cf(path, init = {}) {
  const res = await fetch(base + path, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errs = (json.errors || []).map((e) => `${e.code}: ${e.message}`).join('; ');
    throw new Error(`Cloudflare API ${res.status} on ${path}: ${errs || 'no error body'}`);
  }
  return json.result;
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
  if (action === 'deploy' || action === 'set-production-branch') {
    const form = new FormData();
    form.set('branch', productionBranch);
    const d = await cf('/deployments', { method: 'POST', body: form });
    console.log(`created deployment: ${line(d)}`);
  }
})().catch((e) => { console.log(e.message); process.exit(1); });
