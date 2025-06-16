
import React, { useState, useEffect } from 'react';
import { useBudgetDatabase } from '@/hooks/useBudgetDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const AllocationSliders = () => {
  const { income, allocations, saveBudget } = useBudgetDatabase();
  const [localAllocations, setLocalAllocations] = useState(allocations);

  useEffect(() => {
    setLocalAllocations(allocations);
  }, [allocations]);

  const handleSliderChange = (category: 'needs' | 'wants' | 'savings', value: number) => {
    const newAllocations = { ...localAllocations, [category]: value };
    const total = newAllocations.needs + newAllocations.wants + newAllocations.savings;

    if (total > 100) {
      const diff = total - 100;
      const otherCategories = (['needs', 'wants', 'savings'] as const).filter(c => c !== category);
      let remainingDiff = diff;

      for (const cat of otherCategories) {
        const reduction = Math.min(newAllocations[cat], remainingDiff);
        newAllocations[cat] -= reduction;
        remainingDiff -= reduction;
        if (remainingDiff <= 0) break;
      }
    }
    
    setLocalAllocations(newAllocations);
  };
  
  const handleCommit = () => {
    const total = localAllocations.needs + localAllocations.wants + localAllocations.savings;
    if (total !== 100) {
      const diff = 100 - total;
      const balancedAllocations = {...localAllocations, savings: localAllocations.savings + diff};
      saveBudget(income, balancedAllocations);
    } else {
      saveBudget(income, localAllocations);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alokasi Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="needs" className="flex justify-between">
            <span>Kebutuhan</span>
            <span>{localAllocations.needs}%</span>
          </Label>
          <Slider
            id="needs"
            min={0}
            max={100}
            step={1}
            value={[localAllocations.needs]}
            onValueChange={([value]) => handleSliderChange('needs', value)}
            onValueCommit={handleCommit}
            className="[&>span:first-child]:bg-needs"
          />
        </div>
        <div>
          <Label htmlFor="wants" className="flex justify-between">
            <span>Keinginan</span>
            <span>{localAllocations.wants}%</span>
          </Label>
          <Slider
            id="wants"
            min={0}
            max={100}
            step={1}
            value={[localAllocations.wants]}
            onValueChange={([value]) => handleSliderChange('wants', value)}
            onValueCommit={handleCommit}
            className="[&>span:first-child]:bg-wants"
          />
        </div>
        <div>
          <Label htmlFor="savings" className="flex justify-between">
            <span>Tabungan</span>
            <span>{localAllocations.savings}%</span>
          </Label>
          <Slider
            id="savings"
            min={0}
            max={100}
            step={1}
            value={[localAllocations.savings]}
            onValueChange={([value]) => handleSliderChange('savings', value)}
            onValueCommit={handleCommit}
            className="[&>span:first-child]:bg-savings"
          />
        </div>
        {(localAllocations.needs + localAllocations.wants + localAllocations.savings) !== 100 && (
          <div className="text-center text-sm text-destructive font-semibold">Total alokasi harus 100%</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocationSliders;
