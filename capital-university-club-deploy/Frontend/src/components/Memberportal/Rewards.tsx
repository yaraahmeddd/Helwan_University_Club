import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../StaffPagesComponents/ui/table";

const Rewards: React.FC = () => {
  const rewardsCatalog = [
    {
      title: "Membership Renewal Discount",
      description: "10% off on membership renewal",
      cost: "500 points",
    },
    {
      title: "Free Training Session",
      description: "One personal training session",
      cost: "800 points",
    },
    {
      title: "Club Merchandise",
      description: "Club t-shirt or water bottle",
      cost: "300 points",
    },
  ];

  const leaderboard = [
    { rank: 1, member: "Sarah Johnson", points: 2150 },
    { rank: 2, member: "Michael Chen", points: 1980 },
    { rank: 3, member: "Emma Wilson", points: 1750 },
    { rank: 4, member: "John Doe", points: 1250 },
  ];

  return (
    <div id="rewards" className="space-y-8">
      {/* My Rewards Points */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            My Rewards Points
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-xl shadow-sm mb-6">
          <div className="text-4xl font-bold text-amber-500">1,250 pts</div>
          <button className="mt-4 md:mt-0 bg-amber-500 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-600 transition shadow-sm">
            Redeem Points
          </button>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border">
          <h3 className="text-base font-semibold text-gray-700 mb-2">
            Points History
          </h3>
          <p className="text-gray-600">Earned from daily activities: 850 pts</p>
          <p className="text-gray-600">
            Earned from event participation: 300 pts
          </p>
          <p className="text-gray-600">Earned from fitness goals: 100 pts</p>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Rewards Catalog
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {rewardsCatalog.map((reward, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg shadow-sm hover:shadow-md hover:border-l-blue-500 transition"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                {reward.title}
              </h3>
              <p className="text-gray-600">{reward.description}</p>
              <p className="text-gray-700 mt-2 mb-3 font-medium">Cost: {reward.cost}</p>
              <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Leaderboard</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 text-gray-700">
              <TableRow>
                <TableHead className="p-3 border-b font-medium">Rank</TableHead>
                <TableHead className="p-3 border-b font-medium">Member</TableHead>
                <TableHead className="p-3 border-b font-medium">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, i) => (
                <TableRow key={i} className="hover:bg-gray-50 transition">
                  <TableCell className="p-3 border-b font-semibold text-gray-700">
                    {entry.rank}
                  </TableCell>
                  <TableCell className="p-3 border-b">{entry.member}</TableCell>
                  <TableCell className="p-3 border-b text-blue-600 font-medium">
                    {entry.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
