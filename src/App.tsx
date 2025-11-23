import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Architecture from "./pages/Architecture";
import Feriados from "./pages/Feriados";
import Calendario from "./pages/Calendario";
import AssistenteIA from "./pages/AssistenteIA";
import Documentos from "./pages/Documentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/feriados" element={<Feriados />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/assistente" element={<AssistenteIA />} />
          <Route path="/documentos" element={<Documentos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
