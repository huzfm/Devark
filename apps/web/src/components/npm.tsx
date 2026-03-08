"use client";

import { useState, useEffect } from "react";

interface NpmDownloadsProps {
  packageName: string;
  children: (downloads: number | null) => React.ReactNode;
}

export default function NpmDownloads({ packageName, children }: NpmDownloadsProps) {
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`https://api.npmjs.org/downloads/point/last-month/${packageName}`);
        if (!res.ok) throw new Error("Failed to fetch NPM downloads");
        const data = await res.json();
        setDownloads(data.downloads);
      } catch (err) {
        console.error(err);
        setDownloads(null);
      }
    };

    fetchDownloads();
  }, [packageName]);

  return <>{children(downloads)}</>;
}
