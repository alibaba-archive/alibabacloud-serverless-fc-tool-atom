import { RpcAttribute, RpcKind } from '@pandorajs/semantic-conventions';
import { Dict } from '../type';
import { reverseDict } from './object';
import { QueryResult } from '../types/metric';
import { safeAssert } from '..';
import { ReadableProject } from '../interface';
import { getFullServiceName, DeploymentStage } from '../utils/platform';

export interface QueryOptions {
  stepSeconds: number;
  groupBy?: string[];
}

export type QueryDeclFn = (
  projectId: string,
  labels: Dict<string>,
  options: QueryOptions
) => string;

export type PlatformQueryDeclFn = (
  project: ReadableProject,
  labels: Dict<string>,
  options: QueryOptions
) => string;

export const ql: { [key: string]: QueryDeclFn } = {
  rpc_request_count: (project_id, labels, options) =>
    promQLIncreaseSum(
      `rpc_request_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    ),
  rpc_request_qps: (project_id, labels, options) =>
    `${promQLIncreaseSum(
      `rpc_request_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    )} / ${options.stepSeconds}`,
  rpc_response_duration_count: (project_id, labels, options) =>
    promQLIncreaseSum(
      `rpc_response_duration_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    ),
  rpc_response_duration_sum: (project_id, labels, options) =>
    promQLIncreaseSum(
      `rpc_response_duration_sum{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    ),
  rpc_response_duration_avg: (project_id, labels, options) => {
    return `${promQLIncreaseSum(
      `rpc_response_duration_sum{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    )} / ${promQLIncreaseSum(
      `rpc_response_duration_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    )}`;
  },
  rpc_response_error_count: (project_id, labels, options) =>
    promQLIncreaseSum(
      `rpc_response_error_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        ...labels,
        project_id,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    ),
  rpc_response_error_rate: (project_id, labels, options) => {
    return `${promQLIncreaseSum(
      `rpc_response_error_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        ...labels,
        project_id,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    )} / ${promQLIncreaseSum(
      `rpc_request_count{${labelToPromQL({
        [RpcAttribute.KIND]: String(RpcKind.SERVER),
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    )}`;
  },
  pandora_exception_recorded: (project_id, labels, options) =>
    promQLIncreaseSum(
      `pandora_exception_recorded{${labelToPromQL({
        project_id,
        ...labels,
      })}}`,
      options.stepSeconds,
      promQLGroupBy(options.groupBy)
    ),
  system_load_1min: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_load_1min', false),
  system_load_5min: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_load_5min', false),
  system_load_15min: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_load_15min', false),
  system_mem_used_bytes: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_used_bytes',
      false
    ),
  system_mem_total_bytes: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_total_bytes',
      false
    ),
  system_mem_used_percent: (project_id, labels, options) => {
    return `(${getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_used_bytes',
      false
    )} - ${getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_cached_bytes',
      false
    )} - ${getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_buffers_bytes',
      false
    )}) / ${getSystemPromQL(
      project_id,
      labels,
      options,
      'system_mem_total_bytes',
      false
    )}`;
  },
  system_disk_free_bytes: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'system_disk_free_bytes',
      false
    ),
  system_disk_total_bytes: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'system_disk_total_bytes',
      false
    ),
  system_net_in_bytes: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_net_in_bytes', true),
  system_net_in_errs: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_net_in_errs', true),
  system_net_out_bytes: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_net_out_bytes', true),
  system_net_out_errs: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'system_net_out_errs', true),
  v8_heap_space_used_size: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'v8_heap_space_used_size',
      false
    ),
  v8_heap_space_size: (project_id, labels, options) =>
    getSystemPromQL(project_id, labels, options, 'v8_heap_space_size', false),
  v8_total_heap_size_avg: (project_id, labels, options) =>
    getSystemPromQL(
      project_id,
      labels,
      options,
      'v8_heap_stat_total_heap_size',
      false
    ),
  v8_total_heap_size_max: (project_id, labels, options) =>
    `avg(max(avg_over_time(v8_heap_stat_total_heap_size{${labelToPromQL({
      ...labels,
      project_id,
    })}}[${options.stepSeconds}s])) by (deployment_replica_sn,${promQLGroupBy(
      options.groupBy,
      true
    )})) ${promQLGroupBy(options.groupBy)}`,
};

export function getSystemPromQL(
  project_id: string,
  labels: Dict<string>,
  options: QueryOptions,
  metric: string,
  increase: boolean,
  ignoreProjectId = false
): string {
  const finalLabels = ignoreProjectId ? labels : { ...labels, project_id };
  return increase
    ? `avg(increase(${metric}{${labelToPromQL(finalLabels)}}[${
        options.stepSeconds
      }s])) ${promQLGroupBy(options.groupBy)}`
    : `avg(avg_over_time(${metric}{${labelToPromQL(finalLabels)}}[${
        options.stepSeconds
      }s])) ${promQLGroupBy(options.groupBy)}`;
}

export function labelToPromQL(labels: Dict<string>): string {
  let result = '';
  let first = true;
  for (const [key, val] of Object.entries(labels)) {
    const tagK = translatePromTagK(key, true);
    if (val == null) {
      continue;
    }
    safeAssert(promValidateKey(tagK), `Invalid metric label key: ${tagK}`, 400);
    result +=
      (first ? '' : ',') + tagK + '="' + promEscapeLabelValue(val) + '"';
    first = false;
  }
  return result;
}

export function promQLGroupBy(
  groupBy?: string[],
  omitByKeyword = false
): string {
  if (groupBy?.length) {
    const groupByList = groupBy.map(tagK => translatePromTagK(tagK, true));
    for (const v of groupByList) {
      safeAssert(promValidateKey(v), `Invalid metric group by key: ${v}`, 400);
    }
    if (omitByKeyword) {
      return groupByList.join(',');
    }
    return `by (${groupByList.join(',')})`;
  }
  return '';
}

/**
 * Prometheus increase 函数对于新增的时间线无法妥善处理，这里通过对比前一个时间点是否有数据来决定是否直接取值
 * 如以下时间线的 4 个时间点：
 * 10:00:00 | - 无数据点
 * 10:00:15 | * 直接取值
 * 10:00:30 | * 取 increase
 * 10:00:45 | * 取 increase
 *
 * 只能用于 counter 类型指标。
 *
 * @see https://github.com/prometheus/prometheus/issues/1673
 *
 * @param metricSelector
 * @param stepSeconds
 * @param groupBy
 */
function promQLIncreaseSum(
  metricSelector: string,
  stepSeconds: number,
  groupBy: string
) {
  const naiveMonotonicIncrease = `${metricSelector} - ${metricSelector} offset ${stepSeconds}s) and resets(${metricSelector}[${stepSeconds}s]`;
  // @see https://stackoverflow.com/questions/57788605/prometheus-rate-on-series-by-regex
  const fallback = `sum(${metricSelector} unless ${metricSelector} offset ${stepSeconds}s) without (__name__)`;
  const increaseWithResets = `increase(${metricSelector}[${stepSeconds}s]) unless (${fallback}) or (${fallback})`;
  const complex = `(${increaseWithResets}) unless (${naiveMonotonicIncrease}) or (${naiveMonotonicIncrease})`;
  return `sum(${complex}) ${groupBy}`;
}

const promKeyRegex = /[a-zA-Z_:][a-zA-Z0-9_:]*/;
function promValidateKey(key: string): boolean {
  return promKeyRegex.test(key);
}

function escapeString(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}

function promEscapeLabelValue(str: string): string {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return escapeString(str).replace(/"/g, '\\"');
}

export function parsePromResult(data: QueryResult): QueryResult {
  if (data.resultType === 'matrix') {
    data.result.forEach(res => {
      res.values = res.values.map(([time, val]) => [time * 1000, val]); // 时间统一为毫秒
      const metric: Dict<string> = {};
      for (const [key, val] of Object.entries(res.metric || {})) {
        metric[translatePromTagK(key, false)] = val;
      }
      res.metric = metric;
    });
  }
  return data;
}

const promTagKMap: Dict<string> = {
  rpc_method: 'rpc.method',
  rpc_service_name: 'rpc.service_name',
  rpc_kind: RpcAttribute.KIND,
  v8_heap_space_name: 'v8.heap_space_name',
};

const promTagKMapReverse: Dict<string> = reverseDict(promTagKMap);

function translatePromTagK(key: string, toPromTagK: boolean): string {
  if (toPromTagK) {
    return promTagKMapReverse[key] || key;
  } else {
    return promTagKMap[key] || key;
  }
}

const fcMetricsQl: { [key: string]: PlatformQueryDeclFn } = {
  system_cpu_percent: (project, labels, options) =>
    `${getSystemPromQL(
      project.id,
      {
        ...labels,
        aliyun_fc_function_name: project.scopeExternalName,
        aliyun_fc_service_name: getFullServiceName(
          project.scopeNamespace,
          labels.deployment_stage ?? DeploymentStage.PUBLISH
        ),
      },
      options,
      'aliyun_fc_ca_cpu_usage_percent',
      false,
      true
    )} / 100`,
  system_mem_percent: (project, labels, options) =>
    `${getSystemPromQL(
      project.id,
      {
        ...labels,
        aliyun_fc_function_name: project.scopeExternalName,
        aliyun_fc_service_name: getFullServiceName(
          project.scopeNamespace,
          labels.deployment_stage ?? DeploymentStage.PUBLISH
        ),
      },
      options,
      'aliyun_fc_ca_mem_usage_percent',
      false,
      true
    )} / 100`,
  elastic_replica_total_count: (project, labels, options) =>
    `sum(aliyun_fc_containers_busy{${labelToPromQL({
      ...labels,
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}} + aliyun_fc_containers_free{${labelToPromQL({
      ...labels,
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}}) ${promQLGroupBy(options.groupBy)}`,
  elastic_replica_busy_count: (project, labels, options) =>
    /**
     * Stabilize result over time
     */
    `sum(avg_over_time(aliyun_fc_containers_busy{${labelToPromQL({
      ...labels,
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}}[${options.stepSeconds}s])) ${promQLGroupBy(options.groupBy)}`,
  elastic_replica_provision_count: (project, labels, options) =>
    `sum(aliyun_fc_container_provision_target_count{${labelToPromQL({
      ...labels,
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}}) ${promQLGroupBy(options.groupBy)}`,
  elastic_replica_on_demand_count: (project, labels, options) =>
    `sum(aliyun_fc_containers_busy{${labelToPromQL({
      ...labels,
      aliyun_fc_module: 'eerouter',
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}} + aliyun_fc_containers_free{${labelToPromQL({
      ...labels,
      aliyun_fc_module: 'eerouter',
      aliyun_fc_function_name: project.scopeExternalName,
      aliyun_fc_service_name: getFullServiceName(
        project.scopeNamespace,
        labels.deployment_stage ?? DeploymentStage.PUBLISH
      ),
    })}}) ${promQLGroupBy(options.groupBy)}`,
};

fcMetricsQl['flex_containers_consumed'] =
  fcMetricsQl.elastic_replica_total_count;
fcMetricsQl['flex_containers_busy'] = fcMetricsQl.elastic_replica_busy_count;
fcMetricsQl['flex_containers_provision_target_count'] =
  fcMetricsQl.elastic_replica_provision_count;
fcMetricsQl['flex_containers_flex_count'] =
  fcMetricsQl.elastic_replica_on_demand_count;

export { fcMetricsQl };
