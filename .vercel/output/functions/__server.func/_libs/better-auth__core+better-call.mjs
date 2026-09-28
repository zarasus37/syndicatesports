//#region node_modules/@better-auth/core/dist/utils/error-codes.mjs
function defineErrorCodes(codes) {
	return Object.fromEntries(Object.entries(codes).map(([key, value]) => [key, {
		code: key,
		message: value,
		toString: () => key
	}]));
}
//#endregion
//#region node_modules/better-call/dist/error.mjs
function isErrorStackTraceLimitWritable() {
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return Object.prototype.hasOwnProperty.call(desc, "writable") ? desc.writable : desc.set !== void 0;
}
/**
* Hide internal stack frames from the error stack trace.
*/
function hideInternalStackFrames(stack) {
	const lines = stack.split("\n    at ");
	if (lines.length <= 1) return stack;
	lines.splice(1, 1);
	return lines.join("\n    at ");
}
/**
* Creates a custom error class that hides stack frames.
*/
function makeErrorForHideStackFrame(Base, clazz) {
	class HideStackFramesError extends Base {
		#hiddenStack;
		constructor(...args) {
			if (isErrorStackTraceLimitWritable()) {
				const limit = Error.stackTraceLimit;
				Error.stackTraceLimit = 0;
				super(...args);
				Error.stackTraceLimit = limit;
			} else super(...args);
			const stack = (/* @__PURE__ */ new Error()).stack;
			if (stack) this.#hiddenStack = hideInternalStackFrames(stack.replace(/^Error/, this.name));
		}
		get errorStack() {
			return this.#hiddenStack;
		}
	}
	Object.defineProperty(HideStackFramesError.prototype, "constructor", {
		get() {
			return clazz;
		},
		enumerable: false,
		configurable: true
	});
	return HideStackFramesError;
}
var statusCodes = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	MULTIPLE_CHOICES: 300,
	MOVED_PERMANENTLY: 301,
	FOUND: 302,
	SEE_OTHER: 303,
	NOT_MODIFIED: 304,
	TEMPORARY_REDIRECT: 307,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	PAYLOAD_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	"I'M_A_TEAPOT": 418,
	MISDIRECTED_REQUEST: 421,
	UNPROCESSABLE_ENTITY: 422,
	LOCKED: 423,
	FAILED_DEPENDENCY: 424,
	TOO_EARLY: 425,
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	VARIANT_ALSO_NEGOTIATES: 506,
	INSUFFICIENT_STORAGE: 507,
	LOOP_DETECTED: 508,
	NOT_EXTENDED: 510,
	NETWORK_AUTHENTICATION_REQUIRED: 511
};
var InternalAPIError = class extends Error {
	status;
	body;
	headers;
	statusCode;
	constructor(status = "INTERNAL_SERVER_ERROR", body = void 0, headers = {}, statusCode = typeof status === "number" ? status : statusCodes[status]) {
		super(body?.message, body?.cause ? { cause: body.cause } : void 0);
		this.status = status;
		this.body = body;
		this.headers = headers;
		this.statusCode = statusCode;
		this.name = "APIError";
		this.status = status;
		this.headers = headers;
		this.statusCode = statusCode;
		this.body = body;
	}
};
makeErrorForHideStackFrame(InternalAPIError, Error);
//#endregion
//#region node_modules/@better-auth/core/dist/error/index.mjs
var BetterAuthError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "BetterAuthError";
		this.message = message;
		this.stack = "";
	}
};
//#endregion
//#region node_modules/@better-auth/core/dist/env/env-impl.mjs
var _envShim = Object.create(null);
var _getEnv = (useShim) => globalThis.process?.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
var env = new Proxy(_envShim, {
	get(_, prop) {
		return _getEnv()[prop] ?? _envShim[prop];
	},
	has(_, prop) {
		return prop in _getEnv() || prop in _envShim;
	},
	set(_, prop, value) {
		const env = _getEnv(true);
		env[prop] = value;
		return true;
	},
	deleteProperty(_, prop) {
		if (!prop) return false;
		const env = _getEnv(true);
		delete env[prop];
		return true;
	},
	ownKeys() {
		const env = _getEnv(true);
		return Object.keys(env);
	}
});
env.NODE_ENV;
/**
* Get environment variable with fallback
*/
function getEnvVar(key, fallback) {
	if (typeof process !== "undefined" && process.env) return process.env[key] ?? fallback;
	if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
	if (typeof Bun !== "undefined") return Bun.env[key] ?? fallback;
	return fallback;
}
Object.freeze({
	get BETTER_AUTH_SECRET() {
		return getEnvVar("BETTER_AUTH_SECRET");
	},
	get AUTH_SECRET() {
		return getEnvVar("AUTH_SECRET");
	},
	get BETTER_AUTH_TELEMETRY() {
		return getEnvVar("BETTER_AUTH_TELEMETRY");
	},
	get BETTER_AUTH_TELEMETRY_ID() {
		return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
	},
	get NODE_ENV() {
		return getEnvVar("NODE_ENV", "development");
	},
	get PACKAGE_VERSION() {
		return getEnvVar("PACKAGE_VERSION", "0.0.0");
	},
	get BETTER_AUTH_TELEMETRY_ENDPOINT() {
		return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "");
	}
});
//#endregion
//#region node_modules/@better-auth/core/dist/utils/url.mjs
/**
* Schemes that execute or embed code when navigated to or accepted as a
* redirect target. These are never safe as an OAuth `redirect_uri` or as a
* client-side navigation target (`window.location.href`, `location.assign`, ...).
*/
var DANGEROUS_URL_SCHEMES = [
	"javascript:",
	"data:",
	"vbscript:"
];
/**
* Returns `false` only when `value` is an absolute URL using a dangerous scheme
* (`javascript:`, `data:`, `vbscript:`). Relative URLs (e.g. `/dashboard`) and
* safe absolute schemes (`http`, `https`, custom app schemes such as
* `myapp://`) return `true`.
*
* Use this to guard browser navigation sinks and any redirect target that may
* originate from untrusted input. It is intentionally narrow: it blocks code
* execution schemes without rejecting relative paths or mobile deep links.
*/
function isSafeUrlScheme(value) {
	let parsed;
	try {
		parsed = new URL(value);
	} catch {
		return true;
	}
	return !DANGEROUS_URL_SCHEMES.includes(parsed.protocol);
}
//#endregion
//#region node_modules/@better-auth/core/dist/utils/string.mjs
function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
var WORD_PATTERN = /[\p{Ll}\d]+|\p{Lu}+(?!\p{Ll})|\p{Lu}[\p{Ll}\d]+|\p{Lo}+/gu;
var APOSTROPHE_PATTERN = /['\u2019]/g;
function splitWords(input) {
	return input.replace(APOSTROPHE_PATTERN, "").match(WORD_PATTERN) ?? [];
}
function toKebabCase(input) {
	return splitWords(input).map((word) => word.toLowerCase()).join("-");
}
//#endregion
export { BetterAuthError as a, env as i, toKebabCase as n, defineErrorCodes as o, isSafeUrlScheme as r, capitalizeFirstLetter as t };
