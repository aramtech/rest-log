const env = (await import("$/server/env.js")).default;
import client from "$/server/database/prisma.ts";
import fs from "fs";

import cluster from "cluster";
const fixed = (await import("$/server/utils/common/index.ts")).math.fixed;

const ObjectError = (await import("$/server/utils/ObjectError/index.js")).default;

if (cluster.isPrimary) {
    fs.writeFileSync(
        `${root_paths.src_path}/utils/JsDoc/assets/user_log_keys.js`,
        `

/**
 * @typedef {${Object.keys(env.log_mappers.user_logs.log_maps)
     .map((el) => `"${el}"`)
     .join("|")}} UserLogKeys
 * 
 */
export default {}
`,
    );
}

/**
 * @typedef {Object} Logger
 */

/**
 * @typedef {String} Base64
 */

/**
 * @typedef {Object} GenericLogBody
 * @property {String} summary
 * @property {String} title
 * @property {Base64} variables
 *
 *
 */

/**
 *
 * @param {Logger} logger
 * @param {String} log_key
 * @param {import("$/server/utils/express/index.ts").Req} request
 * @param {Object} to_spread
 * @returns {GenericLogBody}
 */
export default function log(logger = env.log_mappers.user_logs, log_key, request, to_spread = {}) {
    if (!logger) {
        throw new ObjectError({
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid logger",
                logger: logger,
            },
        });
    }

    if (!logger?.log_maps?.[log_key]) {
        throw new ObjectError({
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid log key",
                log_key,
                logger: logger,
            },
        });
    }
    const $ = request;

    const variables = {};
    const summary = logger.log_maps[log_key].template.replaceAll(/%%(.*?)%%/g, (match, key) => {
        if (logger.log_maps[log_key].variables?.[key]) {
            const value = eval(logger.log_maps[log_key].variables?.[key]);

            variables[key] = value;

            return value;
        } else if (logger.global_variables.variables?.[key]) {
            const value = eval(logger.global_variables.variables?.[key]);
            variables[key] = value;

            return value;
        } else {
            try {
                const value = eval(key);
                variables[key] = value;

                return value;
            } catch (err) {
                throw new ObjectError({
                    status_code: env.response.status_codes.server_error,
                    error: {
                        message: "Invalid log variable",
                        key,
                        match,
                        log_key,
                        error: err,
                        logger: logger,
                    },
                });
            }
        }
    });
    return {
        summary: summary,
        title: log_key,
        variables: Buffer.from(JSON.stringify(variables)).toString("base64"),

        created_at: new Date(),
        created_by_user: {
            connect: {
                user_id: request.user.user_id,
            },
        },
        created_by_user_username: request.user.username,
        created_by_user_full_name: request.user.full_name,
        updated_at: new Date(),
        updated_by_user: {
            connect: {
                user_id: request.user.user_id,
            },
        },
        updated_by_user_username: request.user.username,
        updated_by_user_full_name: request.user.full_name,
        ...(to_spread || {}),
    };
}
/**
 *
 * @param {Logger} logger
 * @param {String} log_key
 * @param {Object} eval_source
 * @returns {String}
 */
export function summary(logger, log_key, eval_source, variables = {}) {
    const $ = eval_source;
    if (!logger.log_maps[log_key]) {
        throw {
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid log key",
                log_key,
                logger: logger,
            },
        };
    }
    const summary = logger.log_maps[log_key].template.replaceAll(/%%(.*?)%%/g, (match, key) => {
        if (logger.log_maps[log_key].variables?.[key]) {
            const value = eval(logger.log_maps[log_key].variables?.[key]);

            variables[key] = value;

            return value;
        } else if (logger.global_variables.variables?.[key]) {
            const value = eval(logger.global_variables.variables?.[key]);
            variables[key] = value;

            return value;
        } else {
            try {
                const value = eval(key);
                variables[key] = value;

                return value;
            } catch (err) {
                throw {
                    status_code: env.response.status_codes.server_error,
                    error: {
                        message: "Invalid variable",
                        key,
                        match,
                        log_key,
                        error: err,
                        logger: logger,
                    },
                };
            }
        }
    });
    return summary;
}

/**
 *
 * @param {import('$/server/utils/JsDoc/assets/user_log_keys.js').UserLogKeys} log_key
 * @param {import('$/server/utils/express/index.ts').Req} request
 * @param {import("$/prisma/client/index.js").Prisma.users_logsCreateInput &{
 *  model: (import("$/server/utils/JsDoc/assets/models.js").Model),
 *  model_id: Number,
 *  model_key: String
 * }} to_spread
 * @param {null} logger
 * @param {*} tx
 */
export async function create_user_log(log_key, request, to_spread, tx = client, logger = env.log_mappers.user_logs) {
    const $ = request;
    if (!logger.log_maps[log_key]) {
        throw new ObjectError({
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid log key",
                log_key,
                logger: logger,
            },
        });
    }

    const variables = {};
    const summary = logger.log_maps[log_key].template.replaceAll(/%%(.*?)%%/g, (match, key) => {
        if (logger.log_maps[log_key].variables?.[key]) {
            const value = eval(logger.log_maps[log_key].variables?.[key]);

            variables[key] = value;

            return value;
        } else if (logger.global_variables.variables?.[key]) {
            const value = eval(logger.global_variables.variables?.[key]);
            variables[key] = value;

            return value;
        } else {
            try {
                const value = eval(key);
                variables[key] = value;

                return value;
            } catch (err) {
                throw new ObjectError({
                    status_code: env.response.status_codes.server_error,
                    error: {
                        message: "Invalid variable",
                        key,
                        match,
                        log_key,
                        error: err,
                        logger: logger,
                    },
                });
            }
        }
    });
    await tx.users_logs.create({
        data: {
            summary: summary,
            title: log_key,
            variables: Buffer.from(JSON.stringify(variables)).toString("base64"),
            ...requester_fields.create(request.user),
            ...(to_spread || {}),
        },
    });
}

import { Prisma } from "$/prisma/client/index.js";
import root_paths from "../../../dynamic_configuration/root_paths.ts";
import requester_fields from "../../../modules/utils/requester_fields/index.ts";
/**
 * @param {import('$/server/utils/JsDoc/assets/employment_position_logs.js').EmploymentPositionLogKeys} log_key
 * @param {import('$/server/utils/express/index.ts').Req} request
 * @param {Prisma.positions_logsCreateInput} to_spread
 * @param {null} logger
 */
export async function create_employment_position_log(log_key, request, to_spread, logger = env.log_mappers.employment_position_logs, tx = client) {
    if (!logger) {
        logger = env.log_mappers.employment_position_logs;
    }

    const $ = request;
    if (!logger.log_maps[log_key]) {
        throw new ObjectError({
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid log key",
                log_key,
                logger: logger,
            },
        });
    }

    const variables = {};
    const summary = logger.log_maps[log_key].template.replaceAll(/%%(.*?)%%/g, (match, key) => {
        if (logger.log_maps[log_key].variables?.[key]) {
            const value = eval(logger.log_maps[log_key].variables?.[key]);

            variables[key] = value;

            return value;
        } else if (logger.global_variables.variables?.[key]) {
            const value = eval(logger.global_variables.variables?.[key]);
            variables[key] = value;

            return value;
        } else {
            try {
                const value = eval(key);
                variables[key] = value;

                return value;
            } catch (err) {
                throw new ObjectError({
                    status_code: env.response.status_codes.server_error,
                    error: {
                        message: "Invalid variable",
                        key,
                        match,
                        log_key,
                        error: err,
                        logger: logger,
                    },
                });
            }
        }
    });
    await tx.positions_logs.create({
        data: {
            summary: summary,
            title: log_key,
            variables: Buffer.from(JSON.stringify(variables)).toString("base64"),
            ...requester_fields.create(request.user),
            ...(to_spread || {}),
        },
    });
}

/**
 *
 * @param {import('$/server/utils/JsDoc/assets/employee_log_keys.js').EmployeeLogKeys} log_key
 * @param {import('$/server/utils/express/index.ts').Req} request
 * @param {(Prisma.employee_logsCreateInput)} to_spread
 * @param {null} logger
 * @returns {Promise<Prisma.employee_logsCreateManyInput>}
 */
export async function create_employee_log(log_key, request, to_spread, tx = null, logger = null, return_body = false) {
    if (!tx) {
        tx = client;
    }

    if (!logger) {
        logger = env.log_mappers.employee_logs;
    }
    const $ = request;
    if (!logger.log_maps[log_key]) {
        throw new ObjectError({
            status_code: env.response.status_codes.server_error,
            error: {
                message: "Invalid log key",
                log_key,
                logger: logger,
            },
        });
    }

    const variables = {};
    const summary = logger.log_maps[log_key].template.replaceAll(/%%(.*?)%%/g, (match, key) => {
        if (logger.log_maps[log_key].variables?.[key]) {
            const value = eval(logger.log_maps[log_key].variables?.[key]);

            variables[key] = value;

            return value;
        } else if (logger.global_variables.variables?.[key]) {
            const value = eval(logger.global_variables.variables?.[key]);
            variables[key] = value;

            return value;
        } else {
            try {
                const value = eval(key);
                variables[key] = value;

                return value;
            } catch (err) {
                throw new ObjectError({
                    status_code: env.response.status_codes.server_error,
                    error: {
                        message: "Invalid variable",
                        key,
                        match,
                        log_key,
                        error: err,
                        logger: logger,
                    },
                });
            }
        }
    });

    if (return_body) {
        return {
            summary: summary,
            title: log_key,
            variables: Buffer.from(JSON.stringify(variables)).toString("base64"),

            created_at: new Date(),
            created_by_user: {
                connect: {
                    user_id: request.user.user_id,
                },
            },
            created_by_user_username: request.user.username,
            created_by_user_full_name: request.user.full_name,
            updated_at: new Date(),
            updated_by_user: {
                connect: {
                    user_id: request.user.user_id,
                },
            },
            updated_by_user_username: request.user.username,
            updated_by_user_full_name: request.user.full_name,
            ...(to_spread || {}),
        };
    } else {
        return await tx.employee_logs.create({
            data: {
                summary: summary,
                title: log_key,
                variables: Buffer.from(JSON.stringify(variables)).toString("base64"),

                created_at: new Date(),
                created_by_user: {
                    connect: {
                        user_id: request.user.user_id,
                    },
                },
                created_by_user_username: request.user.username,
                created_by_user_full_name: request.user.full_name,
                updated_at: new Date(),
                updated_by_user: {
                    connect: {
                        user_id: request.user.user_id,
                    },
                },
                updated_by_user_username: request.user.username,
                updated_by_user_full_name: request.user.full_name,
                ...(to_spread || {}),
            },
        });
    }
}
