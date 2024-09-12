import env from "$/server/env.json" assert { type: "json" };
import cluster from "cluster";
import { dash_date_formater } from "../common/index.js";

export const force_log = console.log;

if (env.logging.hide_all_logs_in_production && env.environment == "production") {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.trace = () => {};
}

export const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    console_color: "\x1b[0m",
};

type LoggerProps = {
    log_level: LogLevel;
    log_as_worker: boolean;
    name: string;
    color: LogColor;
};

const Logger = function (options: LoggerProps) {
    let time = "";
    function update_time() {
        time = dash_date_formater(new Date(), true, true, true);
    }
    const logger = function (...msgs: any[]) {
        if (process.env["NODE_ENV"] === "test") {
            return;
        }

        if (env.logging.hide_all_logs_in_production && env.environment == "production") {
            return;
        }
        if (cluster.isPrimary || options.log_as_worker) {
            if (!msgs[0]) {
                force_log();
                return;
            }
            update_time();
            const console_log = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(options.name).toUpperCase()} ]-[ ${String(
                options.log_level,
            ).toUpperCase()} ]---${colors.console_color}`;
            // const updated_msgs = msgs.map((el: any) => {
            //     if (el instanceof ObjectError) {
            //         return JSON.stringify(
            //             {
            //                 error: el?.error,
            //                 msg: el?.msg,
            //                 status_code: el?.status_code,
            //             },
            //             null,
            //             4,
            //         );
            //     } else {
            //         return el;
            //     }
            // });
            force_log(console_log, ...msgs);
        }
    };

    logger.error = function (...msgs: any[]) {
        if (cluster.isPrimary || options.log_as_worker) {
            if (!msgs[0]) {
                force_log();
                return;
            }

            update_time();
            const console_log = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(options.name).toUpperCase()} ]-[ ERROR ]---${colors.console_color}`;
            // +
            // `${[...msgs].map((el) => String(el)).join(`${colors[options.color]}--${colors.console_color}`)}`;
            force_log(console_log, ...msgs);
        }
    };
    logger.warning = function (...msgs: any[]) {
        if (env.logging.hide_all_logs_in_production && env.environment == "production") {
            return;
        }
        if (!msgs[0]) {
            force_log();
            return;
        }

        if (cluster.isPrimary || options.log_as_worker) {
            update_time();
            const console_log = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(options.name).toUpperCase()} ]-[ WARNING ]---${colors.console_color}`;
            // +
            // `${[...msgs].map((el) => String(el)).join(`${colors[options.color]}--${colors.console_color}`)}`;
            force_log(console_log, ...msgs);
        }
    };
    return logger;
};

type LogColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "console_color";
type LogLevel = "Info" | "Warning" | "Error";
async function local_log_decorator(
    name: string,
    color: LogColor,
    log_to_console: boolean = false,
    log_level: LogLevel = "Info",
    worker: boolean = false,
) {
    if (!log_level) {
        log_level = "Info";
    }
    name = name.toUpperCase();
    const logger = Logger({ name, log_level, log_as_worker: worker, color });
    return logger;
}

export const general_logger = Logger({
    color: "white",
    log_as_worker: true,
    log_level: "Info",
    name: "General",
});

(console as any)._log = console.log;
console.log = general_logger;
console.warn = general_logger.warning;
console.error = general_logger.error;

export { local_log_decorator };
export default local_log_decorator;
