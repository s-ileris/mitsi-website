"use client";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { H1, H2, H3 } from "@/components/typography";
import Link from "next/link";
import Button from "@/components/button";
import { Dialog, Transition } from "@headlessui/react";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { X } from "@/components/creator/svgs";
import ReactPlayer from "react-player";

interface Creation {
  title: string;
  description: string;
  school: string;
  createdAt: Timestamp;
  spotify: string;
  youtube: string;
  fileURLS: string[];
  createdBy: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Creation | null>(null);
  const [exists, setExists] = useState<boolean>(true);
  const [content, setContent] = useState<any>();
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }
  useEffect(() => {
    const docRef = doc(db, "creations", decodeURI(params.id));
    getDoc(docRef).then((r) => {
      if (r.exists()) {
        setData(r.data() as Creation);
      } else {
        setData(null);
        setExists(false);
      }
    });
  }, []);

  function Media({ file }: { file: string }) {
    const clr = file.split("?")[0].split(".");
    const filetype = clr[clr.length - 1];
    const image = ["jpg", "png", "webp", "avif", "gif", "jpeg"];
    const sound = ["mp3", "aac", "ogg", "flac", "alac", "wav"];
    if (image.includes(filetype)) {
      if (screen) {
        return (
          <Image
            width={999}
            height={999}
            src={file}
            alt=""
            onClick={() => {
              setIsOpen(true);
              setContent(
                <Image
                  width={999}
                  height={999}
                  src={file}
                  alt=""
                  className=" max-h-[80vh] w-auto"
                />
              );
            }}
            className="object-cover aspect-square p-2 col-"
          />
        );
      }
    } else if (sound.includes(filetype)) {
      return (
        <div
          onClick={() => {
            setIsOpen(true);
            setContent(
              <ReactPlayer
                controls
                url={file}
                height={80}
                style={{ marginBottom: 8 }}
              />
            );
          }}
          className="sm:p-10 p-6 grid aspect-square border border-black-50 m-2 place-items-end"
        >
          <div className="w-full">
            <H3 className="mb-3">Αρχείο ήχου</H3>
          </div>
        </div>
      );
    } else {
      return (
        <div className="sm:p-10 p-6 grid aspect-square border border-black-50 m-2 place-items-end">
          <div className="w-full">
            <H3 className="mb-3">Αρχείο {filetype}</H3>
            <Link href={file} target="_blank">
              <Button>Λήψη</Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  const linkRegex = /(https?\:\/\/)?(www\.)?[^\s]+\.[^\s]+/g;

  function replacer(matched: string) {
    let withProtocol = matched;
    if (!withProtocol.startsWith("http")) {
      withProtocol = "http://" + matched;
    }
    const newStr = (show: string) =>
      `<a
      target="__blank"
      class="underline text-red underline-offset-2"
      href=${`https://logotexnikes-diadromes.gr/redirect?link=${withProtocol}&from=${window.location.href}`}

      >
      ${show}
      </a>`;
    if (matched.includes("//")) {
      if (matched.split("//")[1].includes("/")) {
        return newStr(matched.split("//")[1].split("/")[0]);
      } else {
        return newStr(matched.split("//")[1]);
      }
    } else {
      return matched;
    }
  }

  return (
    <div className="">
      {exists ? (
        data && (
          <>
            <section className="grid py-24 w-full place-items-center hero border-b">
              <div className="text-center w-[97vw] max-w-screen-md">
                <H1 className="text-red">{data.title}</H1>
                <div className="flex opacity-50 space-x-3 text-sm mx-auto w-fit mb-6">
                  <p>{data.school}</p>
                  <p className="text-red">/</p>
                  <p>
                    {data.createdAt.toDate().getDate() +
                      "." +
                      (data.createdAt.toDate().getMonth() + 1) +
                      "." +
                      data.createdAt.toDate().getFullYear()}
                  </p>
                </div>
                <p
                  className="max-sm:text-xs mt-2"
                  dangerouslySetInnerHTML={{
                    __html: data.description.replaceAll(linkRegex, replacer),
                  }}
                ></p>
              </div>
            </section>
            {data.fileURLS || data.spotify || data.youtube ? (
              <H2 className="text-red sm:mx-11 mx-7 mb-4 relative z-10 mt-10">
                Αρχεία
              </H2>
            ) : null}
            <section className="min-h-screen">
              <div
                className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 sm:mx-10 mx-6"
                id="gallery"
              >
                {data.fileURLS &&
                  data.fileURLS.map((i, key) => <Media key={key} file={i} />)}
                {data.youtube && (
                  <Link
                    href={
                      "https://logotexnikes-diadromes.gr/redirect?link=" +
                      data.youtube +
                      "&from=" +
                      window.location.href
                    }
                    className="sm:p-10 p-6 grid aspect-square border border-black-50 m-2 place-items-end"
                    target="_blank"
                  >
                    <H3 className="w-full">Youtube</H3>
                  </Link>
                )}
                {data.spotify && (
                  <div
                    onClick={() => {
                      setIsOpen(true);
                      setContent(
                        <div>
                          <Link
                            href={
                              "https://logotexnikes-diadromes.gr/redirect?link=" +
                              data.spotify.replace(
                                `/embed/episode/`,
                                `/episode/`
                              ) +
                              "&from=" +
                              window.location.href
                            }
                            target="_blank"
                            className="focus:outline-none"
                          >
                            <p className="text-xs opacity-50 text-right mb-2 underline">
                              Αντιμετωπίσατε κάποιο πρόβλημα;
                            </p>
                          </Link>
                          <iframe
                            className="w-[80vw] max-w-md h-[352px]"
                            src={data.spotify}
                          ></iframe>
                        </div>
                      );
                    }}
                    className="sm:p-10 p-6 grid aspect-square border border-black-50 m-2 place-items-end"
                  >
                    <H3 className="w-full">Spotify</H3>
                  </div>
                )}
              </div>
            </section>
            <Transition appear show={isOpen} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-white" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-5">
                    <>
                      <span className="w-6 h-6 absolute top-10 right-10 cursor-pointer">
                        <X />
                      </span>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Dialog.Panel className={"relative"}>
                          {content}
                          <p className="mt-1 text-sm">{data.title}</p>
                          <p className="opacity-50 text-sm">{data.school}</p>
                        </Dialog.Panel>
                      </Transition.Child>
                    </>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </>
        )
      ) : (
        <div className="grid sm:mx-10 mx-6 min-h-screen text-center">
          <div className="place-self-center -mt-32">
            <img draggable={false} src="/assets/not-found.gif" alt="" />
            <H2>Η δημιουργία δεν βρέθηκε</H2>
          </div>
        </div>
      )}
    </div>
  );
}
