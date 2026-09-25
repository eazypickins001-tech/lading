export type CbmMode = "sea" | "air" | "courier";

export type CbmInput = {
  mode: CbmMode;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity: number;
  actualWeightKg: number;
};

export type CbmResult = {
  cbm: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
};

const VOLUMETRIC_FACTOR: Record<CbmMode, number> = {
  sea: 0,
  air: 167,
  courier: 200,
};

export function calculateCbm(input: CbmInput): CbmResult {
  const quantity = input.quantity > 0 ? input.quantity : 0;
  const cbmPerCarton =
    (input.lengthCm * input.widthCm * input.heightCm) / 1_000_000;
  const cbm = cbmPerCarton * quantity;
  const volumetricWeightKg = cbm * VOLUMETRIC_FACTOR[input.mode];
  const chargeableWeightKg = Math.max(input.actualWeightKg, volumetricWeightKg);

  return { cbm, volumetricWeightKg, chargeableWeightKg };
}
