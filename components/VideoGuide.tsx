"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type GuideVideo = {
  title: string;
  youtubeId: string;
};

const guideVideos: Record<string, GuideVideo> = {
  "/": {
    title: "Navigating Home Page to Student Dashboard",
    youtubeId: "mhkx9t0aGcE",
  },
  "/tutors": {
    title: "Navigating Tutors",
    youtubeId: "msCBblJ456Y",
  },
  "/apply": {
    title: "Tutor Application",
    youtubeId: "7k8ZbYCfAWk",
  },
  "/student/dashboard": {
    title: "Student Dashboard",
    youtubeId: "GJNOc8-LeB0",
  },
  "/book": {
    title: "Request Tutoring Session",
    youtubeId: "SrhBkWkbi4U",
  },
  "/tutor/dashboard": {
    title: "Tutoring Dashboard",
    youtubeId: "Ip8ZO4TzzG0",
  },
};

export default function VideoGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const video =
    guideVideos[pathname] ||
    guideVideos[
      Object.keys(guideVideos).find((path) => pathname.startsWith(path)) || "/"
    ];

  if (!video) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
      >
        <span>▶</span>
        Video Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {video.title}
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-xl font-bold text-gray-600 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}