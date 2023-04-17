import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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

const fetchGetSellers = async (): Promise<Seller[]> => {
  const result = await fetch('/sellers');
  return result.json();
};

const fetchGetSalesHistory = async (): Promise<SalesHistory> => {
  const result = await fetch(`/sellers/history?chunk=${historyFrequency}`);
  return result.json();
};

export const useSeller = (): {
  sellers: Seller[];
  addSeller: (seller: Seller) => void;
} => {
  const [sellers, setSellers] = useState<Seller[]>([]);

  const addSeller = (seller: Seller): void => {
    setSellers((sellersParam: Seller[]) => [...sellersParam, seller]);
  };

  const { data: dataSellers } = useQuery({
    queryKey: ['getSellers'],
    queryFn: fetchGetSellers,
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

  const { data: dataSalesHistory } = useQuery({
    queryKey: ['getSalesHistory'],
    queryFn: fetchGetSalesHistory,
    refetchInterval: intervalTime,
  });

  useEffect(() => {
    if (dataSalesHistory) {
      setSalesHistory(dataSalesHistory);
    }
  }, [dataSalesHistory]);

  return { salesHistory };
};
