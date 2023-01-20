import React from 'react';
import { stringToColor, options, getDataHistory } from './SellerView.hook';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SalesHistory, Seller } from '../Seller.hook';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type SellerContentProps = { sellers: Seller[] };
const getArraySeller = ({ sellers }: SellerContentProps): JSX.Element[] =>
  sellers.map((seller: Seller) => {
    const eu = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(seller.cash);
    var sellerColor = stringToColor(seller.name);
    console.log(sellerColor);
    var showOfflineWarning = !seller.online ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-exclamation-triangle-fill"
        viewBox="0 0 16 16"
      >
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
      </svg>
    ) : (
      ''
    );
    return (
      <tr key={seller.name}>
        <td className="col-md-6">
          <strong style={{ color: sellerColor }}>{seller.name}</strong>
        </td>
        <td className="col-md-5" style={{ color: sellerColor }}>
          {eu}
        </td>
        <td className="col-md-1" style={{ color: sellerColor }}>
          {showOfflineWarning}
        </td>
      </tr>
    );
  });

type SellerViewProps = {
  sellers: Seller[];
  salesHistory: SalesHistory;
};

export class SellerView extends React.Component<SellerViewProps> {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-4">
            <h2>Ranking</h2>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cash</th>
                    <th> </th>
                  </tr>
                </thead>
                <tbody>
                  <>
                    {getArraySeller({ sellers: this.props.sellers }).map(
                      (sellerContent) => sellerContent
                    )}
                  </>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-8">
            <h2>History</h2>
            <Line
              aria-label="Chart - History of sales"
              options={options}
              data={getDataHistory(this.props.sellers, this.props.salesHistory)}
              width="730"
              height="400"
            />
          </div>
        </div>
        <hr />
        <footer>
          <p>Have fun :D </p>
        </footer>
      </div>
    );
  }
}
