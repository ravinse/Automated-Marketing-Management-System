import React from 'react'
import { Button } from "@material-tailwind/react";

const PendingApproval = () => {
  return (
    <div>
       <div class="w-full">
  <h3 class="text-lg font-semibold ml-52 text-slate-800">Pending Approval</h3>
 </div>
 <div class="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border mx-56 mt-10">
  <table class="w-full text-left table-auto min-w-max">
    <thead>
        <tr>
            <th class="p-4 border-b border-slate-300 bg-slate-50">
                <p class="block text-sm font-normal leading-none text-slate-500">
                    Campaign Name
                </p>
            </th>
            <th class="p-4 border-b border-slate-300 bg-slate-50">
                <p class="block text-sm font-normal leading-none text-slate-500">
                    Target Segment
                </p>
            </th>
            <th class="p-4 border-b border-slate-300 bg-slate-50">
                <p class="block text-sm font-normal leading-none text-slate-500">
                    Schedule
                </p>
            </th>
            <th class="p-4 border-b border-slate-300 bg-slate-50">
                <p class="block text-sm font-normal leading-none text-slate-500">
                    Action
                </p>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Summer Sale
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    All Customers
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Jul 1 - Jul 31
                </p>
            </td>
            <td class="flex gap-4 p-4 border-b border-slate-200">
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  Approve
                </button>
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  view
                </button>
            </td>
        </tr>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Back to School
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Parents
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Aug 15 - Sep 15
                </p>
            </td>
            <td class="flex p-4 gap-4 border-b border-slate-200">
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  Approve
                </button>
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  view
                </button>
            </td>
        </tr>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Holiday Promotion
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Loyal Customers
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Dec 1 - Dec 24
                </p>
            </td>
            <td class="flex gap-4 p-4 border-b border-slate-200">
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  Approve
                </button>
                <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition">
                  view
                </button>
            </td>
        </tr>
    </tbody>
  </table>
</div>
 
    </div>
  )
}

export default PendingApproval
