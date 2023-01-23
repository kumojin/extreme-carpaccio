import { Seller, SalesHistory } from '../Seller.hook';

export const stringToColor = (str: string) => {
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

export type GetDataHistoryReturned = {
  labels: string[];
  datasets: {
    label: string;
    borderColor: string;
    backgroundColor: string;
    data: number[];
  }[];
};

export const getDataHistory = (
  sellers: Seller[],
  salesHistory: SalesHistory
): GetDataHistoryReturned => {
  let labels: string[] = [];
  let datasets = [];

  if (salesHistory && sellers) {
    for (const seller in salesHistory.history) {
      let color = stringToColor(seller);
      datasets.push({
        label: seller,
        borderColor: color,
        backgroundColor: color,
        data: salesHistory.history[seller].slice(-10),
      });
    }

    let lastIteration = salesHistory.lastIteration;
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
