import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MyRaces from "./pages/MyRaces";
import CreateRace from "./pages/CreateRace";
import EditRace from "./pages/EditRace";
import RaceOverview from "./pages/RaceOverview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<MyRaces />} />
          <Route path="/race/new" element={<CreateRace />} />
          <Route path="/race/new/duplicate/:duplicateFromId" element={<CreateRace />} />
          <Route path="/race/edit/:raceId" element={<EditRace />} />
          <Route path="/race/:raceId" element={<RaceOverview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
