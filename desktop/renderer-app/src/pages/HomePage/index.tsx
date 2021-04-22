import "./HomePage.less";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMainWindow, ipcReceiveRemove, ipcSyncByApp } from "../../utils/ipc";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLastLocation } from "react-router-last-location";
import { shouldWindowCenter } from "./utils";
import { constants } from "flat-types";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { AppUpgradeModal } from "../../components/AppUpgradeModal";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const lastLocation = useLastLocation();
    const [showModal, setShowModal] = useState(false);
    const sp = useSafePromise();

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: shouldWindowCenter(lastLocation?.pathname),
        });
    }, [lastLocation]);

    useEffect(() => {
        sp(ipcSyncByApp("get-update-info"))
            .then(data => {
                if (data.hasNewVersion) {
                    console.log("[Auto Updater]: has newVersion", data.hasNewVersion);
                    setShowModal(true);
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });

        return () => {
            ipcReceiveRemove("update-progress");
        };
    }, [sp]);

    return (
        <MainPageLayoutContainer>
            <div className="homepage-layout-container">
                <MainRoomMenu />
                <div className="homepage-layout-content">
                    <MainRoomListPanel />
                    <MainRoomHistoryPanel />
                </div>
            </div>
            <AppUpgradeModal visible={showModal} onClose={() => setShowModal(false)} />
        </MainPageLayoutContainer>
    );
});

export default HomePage;
