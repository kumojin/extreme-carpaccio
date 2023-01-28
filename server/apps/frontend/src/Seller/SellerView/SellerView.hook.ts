import { SalesHistory, Seller } from '../Seller.hook';

export const stringToColor = (str: string): string => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash); // eslint-disable-line no-bitwise
  }

  let color = '#';

  for (let j = 0; j < 3; j++) {
    color += `00${((hash >> (j * 8)) & 0xff).toString(16)}`.slice(-2); // eslint-disable-line no-bitwise
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
  const datasets: {
    label: string;
    borderColor: string;
    backgroundColor: string;
    data: number[];
  }[] = [];

  if (salesHistory?.history) {
    const { lastIteration } = salesHistory;

    Object.keys(salesHistory.history).forEach((seller) => {
      const color = stringToColor(seller);
      datasets.push({
        label: seller,
        borderColor: color,
        backgroundColor: color,
        data: salesHistory.history[seller].slice(-10),
      });
    });

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
