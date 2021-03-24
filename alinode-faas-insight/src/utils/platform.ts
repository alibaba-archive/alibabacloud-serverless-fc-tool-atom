import { Dict, safeAssert } from '../';

// fc stage mapping
const fcStageMapping = {
  daily: 'DAILY',
  pre: 'PRE_PUBLISH',
  prod: 'PUBLISH',
} as Dict<string>;
export function getAoneStage(stage: string): string {
  const env =
    Object.entries(fcStageMapping).find(
      ([_, envDesc]) => envDesc === stage
    )?.[0] ?? stage;
  safeAssert(env != null, `can not get env label for stage: ${stage}`);

  return env;
}
export function getFullServiceName(
  scopeNamespace: string,
  stage: string
): string {
  const env = getAoneStage(stage);

  return `${scopeNamespace}-${env}`;
}

export enum SkylineAppUseType {
  PRE_PUBLISH = 'PRE_PUBLISH',
  PUBLISH = 'PUBLISH',
  BETA_PUBLISH = 'BETA_PUBLISH',
  DAILY = 'DAILY',
}

export type DeploymentStage = SkylineAppUseType;
export const DeploymentStage = SkylineAppUseType;
