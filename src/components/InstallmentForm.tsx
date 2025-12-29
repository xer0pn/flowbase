import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Installment, InstallmentProvider, INSTALLMENT_PROVIDER_LABELS } from '@/types/finance';
import { format } from 'date-fns';

interface InstallmentFormProps {
  onSubmit: (installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'status'>) => void;
}

export function InstallmentForm({ onSubmit }: InstallmentFormProps) {
  const [itemName, setItemName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [downPayment, setDownPayment] = useState('0');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalPayments, setTotalPayments] = useState('');
  const [completedPayments, setCompletedPayments] = useState('0');
  const [nextDueDate, setNextDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [interestRate, setInterestRate] = useState('0');
  const [provider, setProvider] = useState<InstallmentProvider>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !totalAmount || !monthlyPayment || !totalPayments) return;

    onSubmit({
      itemName,
      totalAmount: parseFloat(totalAmount),
      downPayment: parseFloat(downPayment) || 0,
      monthlyPayment: parseFloat(monthlyPayment),
      totalPayments: parseInt(totalPayments),
      completedPayments: parseInt(completedPayments) || 0,
      nextDueDate,
      interestRate: parseFloat(interestRate) || 0,
      provider,
    });

    // Reset form
    setItemName('');
    setTotalAmount('');
    setDownPayment('0');
    setMonthlyPayment('');
    setTotalPayments('');
    setCompletedPayments('0');
    setNextDueDate(format(new Date(), 'yyyy-MM-dd'));
    setInterestRate('0');
    setProvider('other');
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold uppercase tracking-wide">Add Installment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemName" className="text-xs uppercase tracking-wide text-muted-foreground">
              Item Name
            </Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="iPhone 15 Pro"
              className="mt-1 border-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="totalAmount" className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Amount
              </Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="5000"
                className="mt-1 border-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="downPayment" className="text-xs uppercase tracking-wide text-muted-foreground">
                Down Payment
              </Label>
              <Input
                id="downPayment"
                type="number"
                step="0.01"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="1000"
                className="mt-1 border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="monthlyPayment" className="text-xs uppercase tracking-wide text-muted-foreground">
                Monthly Payment
              </Label>
              <Input
                id="monthlyPayment"
                type="number"
                step="0.01"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="400"
                className="mt-1 border-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="totalPayments" className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Payments
              </Label>
              <Input
                id="totalPayments"
                type="number"
                value={totalPayments}
                onChange={(e) => setTotalPayments(e.target.value)}
                placeholder="10"
                className="mt-1 border-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="completedPayments" className="text-xs uppercase tracking-wide text-muted-foreground">
                Completed Payments
              </Label>
              <Input
                id="completedPayments"
                type="number"
                value={completedPayments}
                onChange={(e) => setCompletedPayments(e.target.value)}
                placeholder="0"
                className="mt-1 border-2"
              />
            </div>
            <div>
              <Label htmlFor="nextDueDate" className="text-xs uppercase tracking-wide text-muted-foreground">
                Next Due Date
              </Label>
              <Input
                id="nextDueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="mt-1 border-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="interestRate" className="text-xs uppercase tracking-wide text-muted-foreground">
                Interest Rate (%)
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0"
                className="mt-1 border-2"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Provider
              </Label>
              <Select value={provider} onValueChange={(value: InstallmentProvider) => setProvider(value)}>
                <SelectTrigger className="mt-1 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INSTALLMENT_PROVIDER_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full border-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Installment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}