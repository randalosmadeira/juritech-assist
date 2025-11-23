import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AssistenteJuridico } from "@/components/AssistenteJuridico";
import { Header } from "@/components/Header";

const AssistenteIA = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <AssistenteJuridico />
        </div>
      </div>
    </div>
  );
};

export default AssistenteIA;
