import { Trans, useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { BotBanner } from "@/components/brand/BotBanner";
import { BotMark } from "@/components/brand/BotMark";
import { LanguageSelect } from "@/components/form/LanguageSelect";
import { Button, Card, PAGE_TITLE, Skeleton } from "@/components/primitives";
import { SetupNeeded } from "@/features/auth/SetupNeeded";
import { useBotLook } from "@/features/auth/useBot";
import { useSetup } from "@/features/auth/useMe";
import { DashboardOff } from "@/features/site/components/DashboardOff";
import { useSite } from "@/features/site/useSite";
import { usePageTitle } from "@/hooks/usePageTitle";
import { hardRedirect } from "@/lib/redirect";

export function SignInPage(): React.JSX.Element {
	const { t } = useTranslation();
	usePageTitle(t("auth.title"));
	const [params] = useSearchParams();
	const setup = useSetup();
	const bot = useBotLook();
	const site = useSite();
	const returnTo = params.get("returnTo") ?? "/guilds";
	const name = bot.name;

	if (site.data?.dashboard === false) return <DashboardOff />;
	if (setup.data?.configured === false)
		return <SetupNeeded missing={setup.data.missing} redirectUri={setup.data.redirectUri} />;

	return (
		<main className="brutal-grid flex min-h-dvh w-full flex-col items-center justify-center p-6">
			<div className="flex w-full max-w-md flex-col gap-6">
				<LanguageSelect className="self-end" />

				<Card padding="none" className="overflow-hidden">
					<BotBanner src={bot.bannerUrl} accent={bot.accentColour} className="border-border h-24 border-b-2" />

					{/* Positioned, or the banner — which is — paints over the avatar lifted into it. */}
					<div className="relative flex flex-col gap-4 p-6">
						{/* Only the picture is lifted into the banner: the banner is any image, so no text is drawn over it. */}
						<BotMark
							src={bot.avatarUrl}
							name={name}
							size={64}
							className="border-border bg-card brutal-shadow-sm rounded-tile -mt-12 self-start border-2"
						/>
						{name === null ? (
							<>
								<h1 className="sr-only">{t("auth.signIn")}</h1>
								<Skeleton className="h-8 w-40" />
							</>
						) : (
							<h1 className={PAGE_TITLE}>{name}</h1>
						)}

						{name === null ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<p className="text-muted-foreground text-sm font-medium">{t("auth.configureBody", { name })}</p>
						)}

						{params.get("denied") !== null && (
							<p className="text-warning text-sm font-bold" role="status">
								{t("auth.cancelled")}
							</p>
						)}

						<Button
							className="w-full"
							onClick={() => {
								hardRedirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
							}}
						>
							{t("auth.signInWith")}
						</Button>

						<p className="text-muted-foreground font-mono text-xs">
							<Trans
								i18nKey="auth.scopes"
								values={{ name }}
								components={{ scope: <strong className="text-foreground" /> }}
							/>
						</p>
					</div>
				</Card>

				<p className="text-muted-foreground text-center font-mono text-xs">
					<Trans
						i18nKey="auth.agree"
						values={{ name }}
						components={{
							terms: <Link to="/terms" className="hover:text-foreground underline" />,
							privacy: <Link to="/privacy" className="hover:text-foreground underline" />,
						}}
					/>
				</p>
			</div>
		</main>
	);
}
