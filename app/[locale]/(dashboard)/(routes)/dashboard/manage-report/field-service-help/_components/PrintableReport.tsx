"use client"

import { MemberNeedingHelp } from './FieldServiceHelpClient'

type CategoryGroup = {
    category: 'consistently-not-reporting' | 'no-bible-students' | 'irregular'
    label: string
    members: MemberNeedingHelp[]
    color: string
}

type GroupedMembers = {
    groupName: string
    groupId: string
    categories: CategoryGroup[]
    totalMembers: number
}

type Props = {
    grouped: GroupedMembers[]
    month: string
    generatedAt: string
}

export default function PrintableReport({ grouped, month, generatedAt }: Props) {
    const totalMembers = grouped.reduce((sum, g) => sum + g.totalMembers, 0)
    const totalConsistentlyNotReporting = grouped.reduce((sum, g) => 
        sum + (g.categories.find(c => c.category === 'consistently-not-reporting')?.members.length || 0), 0)
    const totalNoBibleStudents = grouped.reduce((sum, g) => 
        sum + (g.categories.find(c => c.category === 'no-bible-students')?.members.length || 0), 0)
    const totalIrregular = grouped.reduce((sum, g) => 
        sum + (g.categories.find(c => c.category === 'irregular')?.members.length || 0), 0)

    return (
        <div className="p-8 bg-white text-black">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold mb-2">Field Service Help Needed</h1>
                <p className="text-lg text-gray-700">{month}</p>
                <p className="text-sm text-gray-500 mt-1">Generated: {generatedAt}</p>
                <p className="text-xs text-gray-500 mt-1">Based on 6-month reporting history</p>
            </div>

            {/* Summary */}
            <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-300">
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold text-red-600">{totalConsistentlyNotReporting}</div>
                        <div className="text-sm text-gray-600">Consistently Not Reporting</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-amber-600">{totalNoBibleStudents}</div>
                        <div className="text-sm text-gray-600">No Bible Students</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-orange-600">{totalIrregular}</div>
                        <div className="text-sm text-gray-600">Irregular Reporter</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600">{totalMembers}</div>
                        <div className="text-sm text-gray-600">Total Needing Help</div>
                    </div>
                </div>
            </div>

            {/* Groups */}
            {grouped.map((group, groupIndex) => (
                <div key={group.groupId} className="mb-8 break-inside-avoid">
                    {/* Group Header */}
                    <div className="bg-gray-800 text-white p-3 rounded-t">
                        <h3 className="text-lg font-semibold">{group.groupName}</h3>
                        <p className="text-sm opacity-90">
                            {group.totalMembers} publisher{group.totalMembers !== 1 ? 's' : ''} needing attention
                        </p>
                    </div>

                    {/* Categories */}
                    {group.categories.map((category, catIndex) => (
                        <div key={category.category} className="mb-4">
                            {/* Category Header */}
                            <div className={`p-2 font-semibold text-sm ${
                                category.color === 'red'
                                    ? 'bg-red-100 text-red-800'
                                    : category.color === 'amber'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-orange-100 text-orange-800'
                            }`}>
                                {category.label} ({category.members.length})
                            </div>

                            {/* Members Table */}
                            <table className="w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">#</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Name</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Phone</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Reported</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">W/ Studies</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Privilege</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.members.map((member, i) => (
                                        <tr key={member._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 px-2 py-2 text-xs">{i + 1}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs font-medium">{member.fullName}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs">{member.phone || '—'}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs text-center">{member.reportedMonths}/6</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs text-center">{member.monthsWithStudents}/6</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs">
                                                {member.privileges.length > 0 ? member.privileges[0].name : '—'}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs text-gray-400">
                                                {/* Empty for overseer notes */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {/* Overseer Signature */}
                    <div className="mt-4 mb-6 flex justify-between items-end text-sm">
                        <div>
                            <p className="font-semibold mb-1">Group Overseer:</p>
                            <div className="border-b border-gray-400 w-48 pb-1"></div>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Date Reviewed:</p>
                            <div className="border-b border-gray-400 w-32 pb-1"></div>
                        </div>
                    </div>

                    {groupIndex < grouped.length - 1 && <div className="page-break-after" />}
                </div>
            ))}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>This report is confidential and for congregation use only.</p>
                <p className="mt-1">Please follow up with each publisher in a loving and encouraging manner.</p>
            </div>

            <style jsx>{`
                @media print {
                    .page-break-after {
                        page-break-after: always;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    )
}
