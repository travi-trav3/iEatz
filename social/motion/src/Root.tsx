import { Composition } from "remotion";
import { ReceiptReel } from "./ReceiptReel";
export const Root = () => (
  <Composition id="ReceiptReel" component={ReceiptReel} durationInFrames={195} fps={30} width={1080} height={1920}
    defaultProps={{ store: "Ralphs · Hermosa Beach", lines: [["ROTISSERIE CHICKEN","8.99"],["CORN TORTILLAS 30CT","3.49"],["JASMINE RICE 2LB","4.29"],["CABBAGE GREEN","1.87"],["LIMES 4","1.00"]], total: "$19.64",
      dishes: [["Chicken tacos w/ slaw","Mon · 15m"],["Chicken fried rice","Tue · 20m"],["Big chopped salad","Wed · 10m"],["Sunday soup (the bones)","Sun · 40m"]], head: "One receipt. Four dinners." }} />
);
