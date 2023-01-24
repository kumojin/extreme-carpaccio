import { SalesHistory, Seller } from '../Seller.hook';

// type colorType = `#${string}`;
export const stringToColor = (str: string): string => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (let j = 0; j < 3; j++) {
    color += ('00' + ((hash >> (j * 8)) & 0xff).toString(16)).slice(-2);
  }

  return color;
};

export const options = {
  scales: {
    y: {
      suggestedMin: 0,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
};

export interface GetDataHistoryReturned {
  labels: string[];
  datasets: Array<{
    label: string;
    borderColor: string;
    backgroundColor: string;
    data: number[];
  }>;
}

export const getDataHistory = (
  sellers: Seller[],
  salesHistory: SalesHistory
): GetDataHistoryReturned => {
  let labels: string[] = [];
  const datasets = [];

  if (salesHistory?.history != null) {
    for (const seller in salesHistory.history) {
      const color = stringToColor(seller);
      datasets.push({
        label: seller,
        borderColor: color,
        backgroundColor: color,
        data: salesHistory.history[seller].slice(-10),
      });
    }

    const lastIteration = salesHistory.lastIteration;
    for (let i = 0; i < lastIteration; i += 10) {
      labels.push(`${i}`);
    }

    labels = labels.slice(-10);
  }

  return {
    labels,
    datasets,
  };
};
