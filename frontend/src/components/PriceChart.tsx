import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { usePriceStream } from "../hooks/usePriceStream";


const PriceChart = ({ eq }) => {
  const { data } = usePriceStream(eq);
  console.log(eq);
  const chartData = useMemo(() => {
    return data
      .filter(d => d.price && d.timestamp)
      .map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        price: d.price
      }));
  }, [data]);

  return (
     <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis dataKey="time" />
          <YAxis domain={["auto", "auto"]} />
          
          <Tooltip />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#4f46e5"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
  );
};

export default PriceChart;