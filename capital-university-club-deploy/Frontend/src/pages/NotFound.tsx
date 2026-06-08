import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocalizedTranslation } from "../hooks/useLocalizedTranslation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLocalizedTranslation("common");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("pageNotFound.message")}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary underline hover:text-primary/90 font-semibold"
        >
          <BackIcon className="w-4 h-4" />
          {t("pageNotFound.goBack")}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
