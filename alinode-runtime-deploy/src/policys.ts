export const RoleName = 'AlinodeFaasReportSlsRole';
export const PolicyName = 'AlinodeFaasReportSlsAccess';

export const getRole = accountId => {
  return {
    RoleName,
    Description: '临时角色，用于投递日志到指定 sls project',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: ['fc.aliyuncs.com'],
        },
      },
    ],
    Version: '1',
  };
};

export const getPolicys = (region, accountId) => {
  const projectName = `alinode-cloud-runtime-${region}`;

  return {
    Version: '1',
    PolicyName,
    Description: '授权 alinode faas custom runtime 投递日志到指定 sls',
    Statement: [
      {
        Action: [
          'log:PostLogStoreLogs',
          'log:ListProject',
          'log:GetProject',
          'log:Get*',
          'log:List*',
        ],
        Resource: [
          `acs:log:${region}:${accountId}:project/${projectName}/logstore/*`,
          'acs:log:*:*:project/*',
        ],
        Effect: 'Allow',
      },
      {
        // TODO 看看要不要拆成两个授权
        Action: ['fc:Get*', 'fc:List*'],
        Resource: '*',
        Effect: 'Allow',
      },
      {
        Action: ['oss:PutObject*'],
        Effect: 'Allow',
        Resource: [`acs:oss:*:*:alinode-insight-${region}/*`],
      },
      {
        Action: ['oss:GetObjects*', 'oss:ListObjects*', 'oss:GetObject*'],
        Effect: 'Allow',
        Resource: [`*`],
      },
    ],
  };
};
