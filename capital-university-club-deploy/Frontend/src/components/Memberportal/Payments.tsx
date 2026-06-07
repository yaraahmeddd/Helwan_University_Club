import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../StaffPagesComponents/ui/table";

const Payments: React.FC = () => {
  const paymentMethods = [
    {
      title: "Credit Card",
      description: "Visa ending in 1234",
      extra: "Expires: 12/2025",
    },
    {
      title: "Digital Wallet",
      description: "Apple Pay",
      extra: "Connected",
    },
  ];

  const paymentHistory = [
    {
      date: "Oct 10, 2023",
      description: "Monthly Membership Fee",
      amount: "$120.00",
      status: "Paid",
    },
    {
      date: "Oct 5, 2023",
      description: "Yoga Class Package",
      amount: "$40.00",
      status: "Paid",
    },
    {
      date: "Sep 28, 2023",
      description: "Equipment Rental",
      amount: "$15.00",
      status: "Paid",
    },
  ];

  const pendingPayments = [
    {
      dueDate: "Nov 15, 2023",
      description: "Membership Renewal",
      amount: "$120.00",
    },
  ];

  return (
    <div id="payments" className="space-y-8">
      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment Methods
          </h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
            Add Payment Method
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paymentMethods.map((method, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg shadow-sm hover:shadow-md hover:border-l-blue-500 transition"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                {method.title}
              </h3>
              <p className="text-gray-600">{method.description}</p>
              <p className="text-gray-700 mt-2 mb-3 font-medium">{method.extra}</p>
              <button className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition shadow-sm">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 text-gray-700">
              <TableRow>
                <TableHead className="p-3 border-b font-medium">Date</TableHead>
                <TableHead className="p-3 border-b font-medium">Description</TableHead>
                <TableHead className="p-3 border-b font-medium">Amount</TableHead>
                <TableHead className="p-3 border-b font-medium">Status</TableHead>
                <TableHead className="p-3 border-b font-medium">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment, i) => (
                <TableRow key={i} className="hover:bg-gray-50 transition">
                  <TableCell className="p-3 border-b">{payment.date}</TableCell>
                  <TableCell className="p-3 border-b">{payment.description}</TableCell>
                  <TableCell className="p-3 border-b">{payment.amount}</TableCell>
                  <TableCell className="p-3 border-b">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full shadow-sm">
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 border-b">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Pending Payments
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 text-gray-700">
              <TableRow>
                <TableHead className="p-3 border-b font-medium">Due Date</TableHead>
                <TableHead className="p-3 border-b font-medium">Description</TableHead>
                <TableHead className="p-3 border-b font-medium">Amount</TableHead>
                <TableHead className="p-3 border-b font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((pending, i) => (
                <TableRow key={i} className="hover:bg-gray-50 transition">
                  <TableCell className="p-3 border-b">{pending.dueDate}</TableCell>
                  <TableCell className="p-3 border-b">{pending.description}</TableCell>
                  <TableCell className="p-3 border-b">{pending.amount}</TableCell>
                  <TableCell className="p-3 border-b">
                    <button className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition shadow-sm">
                      Pay Now
                    </button>
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

export default Payments;
