"use client";

import React, { useEffect, useState } from "react";

import HostedSubscriptionGate from "@/app/component/subscription/HostedSubscriptionGate";

type ProviderSubscriptionLaunchProps = {
  heading: string;
  description: string;
};

const PENDING_CHECKOUT_STORAGE_KEY = "evenit_subscription_checkout_pending";

export default function ProviderSubscriptionLaunch({
  heading,
  description,
}: ProviderSubscriptionLaunchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY) === "true") {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_bottom,#c24747_0%,#a31313_28%,#870a0a_60%,#6e0404_100%)] px-4 py-8 md:px-8 md:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[680px] rounded-[28px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(74,8,8,0.32)] md:px-12 md:py-12">
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-[#0F172A] md:text-[48px] md:leading-[1.1]">
                {heading}
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-8 text-[#475569] md:text-[19px]">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#BD4745] text-base font-semibold text-white transition-colors hover:bg-[#a03735]"
            >
              Subscribe
            </button>

            <p className="text-sm text-[#64748B]">
              Payment opens in a modal and stays on your site.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#0F172A]/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="flex min-h-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <HostedSubscriptionGate
              variant="modal"
              allowSkip
              onRequestClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
