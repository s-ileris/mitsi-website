"use client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { useEffect, useState } from "react";
import User from "@/components/creator/user";
import { UserInfo } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Processing from "@/components/creator/processing";
import Login from "@/components/creator/login";
import toast, { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  const date = mm + "/" + dd + "/" + yyyy;

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserInfo | undefined>(undefined);
  const [authorised, setAuthorised] = useState<boolean>(false);
  const [notified, setNotified] = useState<{
    state: "wait" | "ok" | "error";
    message: string;
  }>({ state: "wait", message: "Περιμένετε..." });

  function sendMail() {
    getAuth()
      .currentUser!.getIdToken(true)
      .then(async (idToken) => {
        const rawResponse = await fetch("/creations/creator/api/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: idToken,
          }),
        });
        const res = await rawResponse.json();
        if (rawResponse.status === 200) {
          setNotified({ state: "ok", message: res.message });
        } else if (rawResponse.status === 208) {
          setNotified({ state: "ok", message: res.message });
        } else {
          toast.error(res.message);
          setNotified({ state: "error", message: res.message });
        }
      })
      .catch(function (error) {
        console.error(error);
        toast.error("Ένα άγνωστο σφάλμα προέκυψε");
        setNotified({ state: "error", message: "Ένα άγνωστο σφάλμα προέκυψε" });
      });
  }
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userdb = docSnap.data();
          setUser(user);
          if (userdb.authorised) {
            setAuthorised(true);
            setLoading(false);
          } else {
            setAuthorised(false);
            setLoading(false);
            sendMail();
          }
        } else {
          setUser(user);
          setAuthorised(false);
          setLoading(false);
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.providerData[0].email,
            createdAt: date,
            authorised: false,
            photoURL: user.photoURL,
            schools: [],
          })
            .then(() => {
              sendMail();
            })
            .catch((e) => {
              toast.error(e.message);
            });
        }
      }
      setLoading(false);
    });
  }, []);

  function body() {
    if (loading) {
      return (
        <div className={"h-screen sm:mx-10 mx-6 grid place-items-center"}>
          <style jsx>
            {`
              .loader {
                margin-top: -50px;
                width: 48px;
                height: 48px;
                border: 2px solid #bb4430;
                border-bottom-color: transparent;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
              }

              @keyframes rotation {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
          <span className="loader"></span>
        </div>
      );
    }
    if (user) {
      if (authorised) {
        return (
          <>
            <header className="fixed bottom-0 right-0 rounded-tl-lg px-4 pt-3 pb-1 z-10">
              <User user={user} />
            </header>
            {children}
          </>
        );
      } else {
        return <Processing user={user} notified={notified} />;
      }
    }
    return <Login />;
  }
  return (
    <div className={"min-h-screen"}>
      {body()}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #00000050",
            borderRadius: "0",
          },
          loading: {
            className: "bg-gradient-to-r from-red via-white to-purple",
          },
          error: {
            style: {
              border: "1px solid #BB4430",
            },
            iconTheme: {
              primary: "white",
              secondary: "#BB4430",
            },
          },
          iconTheme: {
            primary: "white",
            secondary: "black",
          },
        }}
      />
    </div>
  );
}
