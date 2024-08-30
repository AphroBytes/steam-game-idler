import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { FaMedal } from 'react-icons/fa6';
import ExtLink from '../ExtLink';

// TODO: settings option to opt out of being on the leaderboard
//       database integration
//       limit to top 30 results with infinite scrolling to load more

export default function Leaderboard({ steamId }) {
    const [sortConfig, setSortConfig] = useState({
        key: 'gamesIdled',
        direction: 'descending'
    });

    const mockData = [
        { username: 'PlayerOne', id: '25345236527821', avatar: '1fb7dc710d6ebfd7b7b617ab0904ee26dbd8ebde_full', gamesIdled: 4, achievementsUnlocked: 43, appLaunches: 10 },
        { username: 'Jimbo', id: '25345236527821', avatar: '1fb7dc710d6ebfd7b7b617ab0904ee26dbd8ebde_full', gamesIdled: 84, achievementsUnlocked: 23, appLaunches: 2 },
        { username: 'Frank', id: '76561198999797359', avatar: '1fb7dc710d6ebfd7b7b617ab0904ee26dbd8ebde_full', gamesIdled: 12, achievementsUnlocked: 9, appLaunches: 24 },
        { username: 'SomeoneElse', id: '25345236527821', avatar: '1fb7dc710d6ebfd7b7b617ab0904ee26dbd8ebde_full', gamesIdled: 3, achievementsUnlocked: 145, appLaunches: 28 },
    ];

    const sortedData = useMemo(() => {
        let sortableItems = [...mockData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (b[sortConfig.key] < a[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (b[sortConfig.key] > a[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [mockData, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <React.Fragment>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto overflow-x-hidden'>
                <div className='p-4 pt-2'>
                    <div className='flex flex-col mb-4'>
                        <p className='text-lg font-semibold'>
                            Leaderboard
                        </p>
                    </div>

                    {sortedData.length > 0 ? (
                        <div className='bg-container border border-border rounded min-h-[480px] max-h-[340px] overflow-y-auto'>
                            <table className='w-full border-collapse'>
                                <thead className='sticky top-0 z-10'>
                                    <tr className='border-b border-border bg-titlebar text-sm select-none'>
                                        <th className='w-[30px]'></th>
                                        <th className='w-1/4 py-2 px-4 text-left font-semibold cursor-pointer' onClick={() => requestSort('username')}>
                                            Username
                                        </th>
                                        <th className='py-2 px-4 text-left font-semibold cursor-pointer' onClick={() => requestSort('gamesIdled')}>
                                            Games Idled
                                        </th>
                                        <th className='w-1/4 py-2 px-4 text-left font-semibold cursor-pointer' onClick={() => requestSort('achievementsUnlocked')}>
                                            Achievements Unlocked
                                        </th>
                                        <th className='w-1/4 py-2 px-4 text-left font-semibold cursor-pointer' onClick={() => requestSort('appLaunches')}>
                                            App Launches
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <React.Fragment>
                                        {sortedData.map((user, index) => (
                                            <tr key={index} className={`${user.id === steamId ? 'bg-[#bbf3e7] dark:bg-[#06493a] border border-[#40aa93]' : index % 2 === 0 ? 'bg-container' : 'bg-[#f1f1f1] dark:bg-[#1a1a1a]'} text-sm`}>
                                                <td className='p-1.5 px-4 text-center'>
                                                    {index === 0 ? (
                                                        <FaMedal fontSize={22} className='text-[#ffd700]' />
                                                    ) : index === 1 ? (
                                                        <FaMedal fontSize={22} className='text-[#CD7F32]' />
                                                    ) : index === 2 ? (
                                                        <FaMedal fontSize={22} className='text-[#C0C0C0]' />
                                                    ) : (
                                                        <p>{index + 1}</p>
                                                    )}
                                                </td>
                                                <td className='p-1.5 px-4'>
                                                    <ExtLink href={`https://steamcommunity.com/profiles/${user.id}`}>
                                                        <div className='flex gap-2 items-center'>
                                                            <Image
                                                                src={`https://avatars.steamstatic.com/${user.avatar}.jpg`}
                                                                height={40}
                                                                width={40}
                                                                alt={`${user.id} avatar`}
                                                                className='w-[40px] h-[40px]'
                                                            />
                                                            <div className='flex flex-col'>
                                                                <p>{user.username}</p>
                                                                <p className='text-xs text-gray-400'>
                                                                    {user.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </ExtLink>
                                                </td>
                                                <td className='p-1.5 px-4'>{user.gamesIdled}</td>
                                                <td className='p-1.5 px-4'>{user.achievementsUnlocked}</td>
                                                <td className='p-1.5 px-4'>{user.appLaunches}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className='flex justify-center'>
                            <p className='text-sm'>
                                No leaderboard data available yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}