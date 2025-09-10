import React from 'react'

const Completed = () => {
  return (
    <div>
       <div class="w-full">
  <h3 class="text-lg font-semibold ml-52 text-slate-800">Completed</h3>
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
                    Open Rate
                </p>
            </th>
            <th class="p-4 border-b border-slate-300 bg-slate-50">
                <p class="block text-sm font-normal leading-none text-slate-500">
                    CTR
                </p>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Spring Collection
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    All Customers
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Apr 1 - Apr 30
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    20%
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    4%
                </p>
            </td>
        </tr>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Winter Clearance
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    All Customers
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Jan 15 - Jan 15
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    15%
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    3%
                </p>
            </td>
        </tr>
        <tr class="hover:bg-slate-50">
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    New Year's Sale
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    All Customers
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    Dec 1 - Dec 24
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    35%
                </p>
            </td>
            <td class="p-4 border-b border-slate-200">
                <p class="block text-sm text-slate-800">
                    10%
                </p>
            </td>
        </tr>
    </tbody>
  </table>
</div>
 
    </div>
  )
}

export default Completed
