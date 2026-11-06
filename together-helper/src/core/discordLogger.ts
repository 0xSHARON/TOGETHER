import util from "node:util";
import { type TestifyClient } from "@core/client";

export const DEFAULT_DISCORD_LOG_CHANNEL = "1568284208533864498";

interface QueuedLog {
	timestamp: string;
	level: string;
	message: string;
}

class DiscordLogManager {
	private client: TestifyClient | null = null;
	private channelId: string = DEFAULT_DISCORD_LOG_CHANNEL;
	private queue: QueuedLog[] = [];
	private timer: NodeJS.Timeout | null = null;
	private isFlushing = false;
	private consoleCaptured = false;

	init(client: TestifyClient, overrideChannelId?: string): void {
		this.client = client;
		if (overrideChannelId) {
			this.channelId = overrideChannelId;
		}
		if (!this.timer) {
			this.timer = setInterval(() => {
				void this.flush();
			}, 2000);
		}
		this.captureConsole();
	}

	setChannelId(id: string): void {
		if (id && /^\d{17,20}$/.test(id)) {
			this.channelId = id;
		}
	}

	queueLog(level: string, message: string, context?: unknown): void {
		// Avoid logging inside our own flush routine
		if (this.isFlushing) return;

		let formatted = message;
		if (context && typeof context === "object" && Object.keys(context).length > 0) {
			try {
				const ctxStr = JSON.stringify(context);
				if (ctxStr !== "{}") {
					formatted = `${formatted} ${ctxStr}`;
				}
			} catch {
				// Ignore circular references
			}
		}

		if (!formatted.trim()) return;

		const time = new Date().toISOString().substring(11, 19);
		this.queue.push({
			timestamp: time,
			level: level.toUpperCase(),
			message: formatted.trim(),
		});

		// Cap queue size at 500 to avoid unbounded memory
		if (this.queue.length > 500) {
			this.queue.splice(0, this.queue.length - 500);
		}
	}

	private captureConsole(): void {
		if (this.consoleCaptured) return;
		this.consoleCaptured = true;

		const originalLog = console.log;
		const originalInfo = console.info;
		const originalWarn = console.warn;
		const originalError = console.error;

		console.log = (...args: unknown[]) => {
			originalLog.apply(console, args);
			try {
				const msg = util.format(...args);
				this.queueLog("INFO", msg);
			} catch {}
		};

		console.info = (...args: unknown[]) => {
			originalInfo.apply(console, args);
			try {
				const msg = util.format(...args);
				this.queueLog("INFO", msg);
			} catch {}
		};

		console.warn = (...args: unknown[]) => {
			originalWarn.apply(console, args);
			try {
				const msg = util.format(...args);
				this.queueLog("WARN", msg);
			} catch {}
		};

		console.error = (...args: unknown[]) => {
			originalError.apply(console, args);
			try {
				const msg = util.format(...args);
				this.queueLog("ERROR", msg);
			} catch {}
		};
	}

	async flush(): Promise<void> {
		if (this.isFlushing || !this.client || !this.client.isReady() || this.queue.length === 0) {
			return;
		}

		this.isFlushing = true;

		try {
			const target = await this.client.channels.fetch(this.channelId).catch(() => null);
			if (!target || !target.isTextBased() || !target.isSendable()) {
				// Channel not reachable, keep queue bounded and exit
				if (this.queue.length > 100) {
					this.queue = this.queue.slice(-100);
				}
				this.isFlushing = false;
				return;
			}

			// Batch logs into chunks under 1900 chars each
			const linesToSend: string[] = [];
			while (this.queue.length > 0 && linesToSend.length < 30) {
				const item = this.queue.shift();
				if (!item) break;

				const badge =
					item.level === "ERROR" || item.level === "FATAL"
						? "🔴"
						: item.level === "WARN"
							? "🟡"
							: item.level === "DEBUG"
								? "🟣"
								: "🟢";

				linesToSend.push(`${badge} \`[${item.timestamp}]\` **[${item.level}]** ${item.message}`);
			}

			if (linesToSend.length > 0) {
				// Split into batches fitting in Discord's 2000 character limit
				let currentMessage = "";
				const messages: string[] = [];

				for (const line of linesToSend) {
					if (currentMessage.length + line.length + 1 > 1850) {
						messages.push(currentMessage);
						currentMessage = line;
					} else {
						currentMessage = currentMessage ? `${currentMessage}\n${line}` : line;
					}
				}
				if (currentMessage) {
					messages.push(currentMessage);
				}

				for (const msg of messages) {
					await target.send({
						content: msg,
						allowedMentions: { parse: [] },
					}).catch(() => null);
				}
			}
		} catch {
			// Silently absorb to prevent crashing bot
		} finally {
			this.isFlushing = false;
		}
	}
}

export const discordLogger = new DiscordLogManager();

