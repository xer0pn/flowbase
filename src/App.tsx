import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import IncomeStatement from "./pages/IncomeStatement";
import IncomeSources from "./pages/IncomeSources";
import RecurringExpenses from "./pages/RecurringExpenses";
import BillsCalendar from "./pages/BillsCalendar";
import FinancialGoals from "./pages/FinancialGoals";
import BalanceSheet from "./pages/BalanceSheet";
import CashFlowStatement from "./pages/CashFlowStatement";
import Installments from "./pages/Installments";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Index /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/income-statement" element={
            <ProtectedRoute>
              <AppLayout><IncomeStatement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/income-sources" element={
            <ProtectedRoute>
              <AppLayout><IncomeSources /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/recurring-expenses" element={
            <ProtectedRoute>
              <AppLayout><RecurringExpenses /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/bills-calendar" element={
            <ProtectedRoute>
              <AppLayout><BillsCalendar /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/financial-goals" element={
            <ProtectedRoute>
              <AppLayout><FinancialGoals /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/balance-sheet" element={
            <ProtectedRoute>
              <AppLayout><BalanceSheet /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/cash-flow-statement" element={
            <ProtectedRoute>
              <AppLayout><CashFlowStatement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/installments" element={
            <ProtectedRoute>
              <AppLayout><Installments /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <AppLayout><Portfolio /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
