import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

const historyFrequency = 10;
const intervalTime = 5000;

export type Seller = {
  cash: number;
  name: string;
  online: boolean;
};
export type SellerForm = {
  name: string;
  password: string;
  url: string;
};
export type AddSellerType = (seller: Seller) => void;

export type SalesHistory =
  | {
      lastIteration: number;
      history: Record<string, number[]>;
    }
  | undefined;

const fetchGetSellers = async () => {
  const result = await fetch('/sellers');
  return result.json();
};

const fetchGetSalesHistory = async () => {
  const result = await fetch(`/sellers/history?chunk=${historyFrequency}`);
  return result.json();
};

export const useSeller = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);

  const addSeller = (seller: Seller) => {
    setSellers((sellers: Seller[]) => [...sellers, seller].sort());
  };

  const { data: dataSellers } = useQuery('getSellers', fetchGetSellers, {
    refetchInterval: intervalTime,
  });

  useEffect(() => {
    if (dataSellers) {
      setSellers(dataSellers);
    }
  }, [dataSellers]);

  return { sellers, addSeller };
};

export const useHistory = (): { salesHistory: SalesHistory } => {
  const [salesHistory, setSalesHistory] = useState<SalesHistory>();

  const { data: dataSalesHistory } = useQuery(
    'getSalesHistory',
    fetchGetSalesHistory,
    {
      refetchInterval: intervalTime,
    }
  );

  useEffect(() => {
    if (dataSalesHistory) {
      setSalesHistory(dataSalesHistory);
    }
  }, [dataSalesHistory]);

  return { salesHistory };
};
