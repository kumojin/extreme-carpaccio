import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import React from 'react';
import { Seller, SalesHistory } from '../Seller.hook';

export const stringToColor = (str: string) => {
  var hash = 0;

  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var color = '#';

  for (var j = 0; j < 3; j++) {
    color += ('00' + ((hash >> (j * 8)) & 0xff).toString(16)).slice(-2);
  }

  return color;
};

export const options = {
  scales: {
    y: {
      min: 0,
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
  var labels: string[] = [];
  var datasets = [];

  if (salesHistory !== undefined && sellers !== undefined) {
    for (const seller in salesHistory.history) {
      var color = stringToColor(seller);
      datasets.push({
        label: seller,
        borderColor: color,
        backgroundColor: color,
        data: salesHistory.history[seller].slice(-10),
      });
    }

    var lastIteration = salesHistory.lastIteration;
    for (var i = 0; i < lastIteration; i += 10) {
      labels.push(i + '');
    }

    labels = labels.slice(-10);
  }

  return {
    labels,
    datasets,
  };
};
