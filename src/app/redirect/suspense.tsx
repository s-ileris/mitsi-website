"use client";
import Button from "@/components/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OgData {
  success: true;
  ogTitle: string;
  ogDescription: string;
  ogImage: {
    url: string;
    type: string;
  }[];
  twitterImage: {
    url: string;
  }[];
  favicon: string;
  requestUrl: string;
}

interface FailedOgData {
  success: false;
  requestUrl: string;
}
type OgResult = OgData | FailedOgData;

export default function ActualPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from")!;
  const link = searchParams.get("link")!;
  const params = searchParams.toString();

  const [pageData, setPageData] = useState<OgResult | null>(null);
  useEffect(() => {
    if (!from) {
      router.push("https://logotexnikes-diadromes.gr");
    }
    if (!link) {
      router.push(decodeURI(from));
    }
    fetchOpenGraphData();
  }, []);

  const getRedirectLink = () => {
    let searchParams = new URLSearchParams(params);
    ["link", "from"].forEach((param) => searchParams.delete(param));
    if (link.includes("?")) {
      return decodeURI(link) + "&" + searchParams;
    } else {
      return decodeURI(link) + "?" + searchParams;
    }
  };

  const getFavicon = (favicon: string, url: string) => {
    if (favicon.startsWith("http")) {
      return favicon;
    } else {
      return url.split("?")[0] + favicon;
    }
  };

  const fetchOpenGraphData = async () => {
    try {
      const response = await fetch(`/redirect/api?link=${decodeURI(link)}`);
      const data = await response.json();
      if (!data.success) {
        setPageData({
          success: false,
          requestUrl: "https://karanassou.gr",
        });
      }
      setPageData(data);
    } catch (error) {
      setPageData({
        success: false,
        requestUrl: link,
      });
    }
  };
  if (pageData) {
    return (
      <div className="grid place-items-center h-[90vh]">
        {pageData &&
          (pageData.success ? (
            <div className="border border-black-50 w-fuld max-w-lg rounded-xl">
              {pageData.ogImage && (
                <img
                  className="w-full rounded-t-xl"
                  src={pageData.ogImage[0].url}
                />
              )}
              <div className="p-5">
                <div className="flex space-x-4 items-center">
                  <div className="border bg-stone-100 border-black/20 rounded-full w-10 h-10 aspect-square p-1">
                    <img
                      src={getFavicon(pageData.favicon, pageData.requestUrl)}
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1 opacity-70">
                      {pageData.requestUrl}
                    </p>
                    <p>{pageData.ogTitle}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{pageData.ogDescription}</p>
                <div className="flex w-full items-end mt-5">
                  <Link href={getRedirectLink()} className="ml-auto ">
                    <Button>Ανακατεύθυνση</Button>
                  </Link>
                </div>{" "}
              </div>
            </div>
          ) : (
            <div className="border border-black-50 p-5 w-full max-w-lg">
              <h1 className="text-2xl text-red">
                Συνέχεια σε{" "}
                <span className="">
                  {decodeURI(link).split("//")[1].split("/")[0]}
                </span>
              </h1>
              <p className="text-base mt-2 leading-snug mb-6">
                Δεν μπορέσαμε να συλλέξουμε περισσότερες πληροφορίες για την
                ιστοσελίδα.
              </p>
              <div className="flex w-full items-end">
                <Link href={getRedirectLink()} className="ml-auto ">
                  <Button>Ανακατεύθυνση</Button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    );
  }
}
