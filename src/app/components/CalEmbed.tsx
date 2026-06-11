"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import styles from "./CTA.module.css";
import { socialLinks } from "@/lib/constants";
import { trackCtaClick } from "@/lib/tracking";

export default function CalEmbed() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#f5b95c" } },
        layout: "month_view",
      });
      cal("on", {
        action: "bookingSuccessful",
        callback: () => trackCtaClick("cal_booking"),
      });
    })();
  }, []);

  return (
    <div id="cal-embed" className={styles.calEmbed}>
      <Cal
        calLink={socialLinks.calUsername}
        style={{ width: "100%", height: "100%", minHeight: "580px", overflow: "auto" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
