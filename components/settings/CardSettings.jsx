import React, { useEffect, useState } from 'react';
import ExtLink from '../ExtLink';
import { Button, Checkbox, Input, Skeleton } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';
import { invoke } from '@tauri-apps/api/tauri';

export default function CardSettings({ settings, setSettings }) {
    let [isLoading, setIsLoading] = useState(false);
    const [sidValue, setSidValue] = useState('');
    const [slsValue, setSlsValue] = useState('');
    const [hasCookies, setHasCookies] = useState(false);
    const [loginState, setLoginState] = useState(false);
    const [steamUser, setSteamUser] = useState(null);
    const [validationError, setValidationError] = useState(false);
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (settings && settings.cardFarming) {
            setLocalSettings(settings);
        }
    }, [settings]);

    useEffect(() => {
        const validateSession = async () => {
            try {
                setIsLoading(true);
                const cookies = JSON.parse(localStorage.getItem('steamCookies'));

                if (cookies && cookies.sid && cookies.sls) {
                    setHasCookies(true);
                    setSidValue(cookies.sid);
                    setSlsValue(cookies.sls);

                    const res = await invoke('validate_session', { sid: cookies.sid, sls: cookies.sls });
                    if (res.user) {
                        setSteamUser(res.user);
                        setLoginState(true);
                        logEvent(`[Settings - Card Farming] Logged in as ${res.user}`);
                    } else {
                        setValidationError(true);
                        logEvent('[Error] [Settings - Card Farming] Incorrect \'Card Farming\' credentials');
                    }
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error in (validateSession):', error);
                logEvent(`[Error] in (validateSession): ${error}`);
            }
        };
        validateSession();
    }, []);

    const handleSidChange = (e) => {
        setSidValue(e.target.value);
    };

    const handleSlsChange = (e) => {
        setSlsValue(e.target.value);
    };

    const handleSave = async () => {
        try {
            if (sidValue.length > 0 && slsValue.length > 0) {
                setIsLoading(true);

                const res = await invoke('validate_session', { sid: sidValue, sls: slsValue });
                if (res.user) {
                    setSteamUser(res.user);
                    setLoginState(true);
                    localStorage.setItem('steamCookies', JSON.stringify({ sid: sidValue, sls: slsValue }));
                    setHasCookies(true);
                    logEvent(`[Settings - Card Farming] Logged in as ${res.user}`);
                } else {
                    setValidationError(true);
                    logEvent('[Error] [Settings - Card Farming] Incorrect \'Card Farming\' credentials');
                    setTimeout(() => {
                        setValidationError(false);
                    }, 4000);
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error in (handleSave):', error);
            logEvent(`[Error] in (handleSave): ${error}`);
        }
    };

    const handleClear = async () => {
        try {
            localStorage.removeItem('steamCookies');
            setSidValue('');
            setSlsValue('');
            setLoginState(false);
            setHasCookies(false);
            logEvent('[Settings - Card Farming] Logged out');
        } catch (error) {
            console.error('Error in (handleClear):', error);
            logEvent(`[Error] in (handleClear): ${error}`);
        }
    };

    const handleCheckboxChange = (e) => {
        try {
            const { name, checked } = e.target;
            const updatedSettings = {
                ...localSettings,
                achievementUnlocker: {
                    ...localSettings.achievementUnlocker
                },
                cardFarming: {
                    ...localSettings.cardFarming,
                    [name]: checked
                }
            };
            const checkboxNames = Object.keys(updatedSettings.cardFarming);
            if (checked) {
                const otherCheckboxName = checkboxNames.find(checkbox => checkbox !== name);
                updatedSettings.cardFarming[otherCheckboxName] = false;
            } else {
                const otherCheckboxName = checkboxNames.find(checkbox => checkbox !== name);
                if (!updatedSettings.cardFarming[otherCheckboxName]) {
                    updatedSettings.cardFarming[name] = true;
                }
            }
            localStorage.setItem('settings', JSON.stringify(updatedSettings));
            updateSettings(updatedSettings);
            logEvent(`[Settings - Card Farming] Changed '${name}' to '${updatedSettings.cardFarming[name]}'`);
        } catch (error) {
            console.error('Error in (handleCheckboxChange):', error);
            logEvent(`[Error] in (handleCheckboxChange): ${error}`);
        }
    };

    const updateSettings = (newSettings) => {
        setLocalSettings(newSettings);
        setSettings(newSettings);
        try {
            localStorage.setItem('settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error in (updateSettings):', error);
            logEvent(`[Error] in (updateSettings): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-4 p-2'>
                <Checkbox
                    name='listGames'
                    isSelected={localSettings?.cardFarming?.listGames}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Card farming list
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='allGames'
                    isSelected={localSettings?.cardFarming?.allGames}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            All games with drops
                        </p>
                    </div>
                </Checkbox>

                <div className='w-full'>
                    <p className='text-xs my-2'>
                        Steam credentials are required in order to use the Card Farming feature. <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki/Settings#steam-credentials'} className='text-blue-400'>Learn more</ExtLink>
                    </p>
                    <div className='flex flex-col'>
                        <div className='flex gap-4'>
                            <Input
                                size='sm'
                                placeholder='sessionid'
                                className='max-w-[200px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={sidValue}
                                onChange={handleSidChange}
                            />
                            <Input
                                size='sm'
                                placeholder='steamLoginSecure'
                                className='max-w-[200px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={slsValue}
                                onChange={handleSlsChange}
                            />
                            <Button
                                isDisabled={hasCookies || !sidValue || !slsValue}
                                size='sm'
                                className='bg-sgi font-semibold text-offwhite rounded-sm'
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button isDisabled={!hasCookies} size='sm' className='font-semibold text-offwhite bg-red-400 rounded-sm' onClick={handleClear}>
                                Clear
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className='flex py-1 h-[16px]'>
                                <Skeleton className='w-[70px] h-[8px] rounded' />
                            </div>
                        ) : (
                            <React.Fragment>
                                {loginState ? (
                                    <p className='text-xs text-green-400' >
                                        Logged in as {steamUser}
                                    </p>
                                ) : (
                                    <React.Fragment>
                                        {validationError && (
                                            <p className='text-xs text-red-400'>
                                                Incorrect credentials
                                            </p>
                                        )}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}