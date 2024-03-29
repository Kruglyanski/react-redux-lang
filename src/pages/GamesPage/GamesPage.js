import React, {useEffect, useMemo, useState} from "react";
import Games from "../../components/Games/Games";
import {useHistory} from 'react-router-dom';
import styles from "./GamesPage.module.scss";
import {fetchWords, getAllUserWordsWithoutDeletedWords} from "../../redux/wordsReducer";
import {useDispatch, useSelector} from "react-redux";
import {useStartGameWithAuth} from "../../hooks/startGameWithAuthHook";
import {getStatistics, putStatistics} from "../../redux/statReducer";

export default function GamesPage({location, match}) {
    const history = useHistory();
    const page = useMemo(() => Math.ceil(Math.random() * 19), []);
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [link, setLink] = useState(null);
    const [isButtonDisable, setIsButtonDisable] = useState(true);
    const dispatch = useDispatch();
    const gamesCount = useSelector(state => state.stat.gamesCount);
    const userId = useSelector(state => state.auth.userId);
    const token = useSelector(state => state.auth.token);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const words = useSelector(state => state.words.items);
    const [currentGroup, setCurrentGroup ] = useState(null);
    const {setUserWords, getWords} = useStartGameWithAuth();
    const bgColors = {
        firsColor: '#1380EE',
        secondColor: '#6970EC',
        thirdColor: '#8D62D5',
        fourthColor: '#A353BD',
        fifthColor: '#E15CB2',
        sixthColor: '#B53C8A',
        accentColor: '#F13765'
    };

    const unitItems = [
        {group: '1', color: bgColors.firsColor},
        {group: '2', color: bgColors.secondColor},
        {group: '3', color: bgColors.thirdColor},
        {group: '4', color: bgColors.fourthColor},
        {group: '5', color: bgColors.fifthColor},
        {group: '6', color: bgColors.sixthColor}
    ];

    useEffect(() => {
        userId && dispatch(getStatistics({userId, token}))
    },[userId, token, dispatch]);

    const buttonHandler = (group) => {
        setCurrentGroup(group);
        isAuthenticated
            ?
            dispatch(getAllUserWordsWithoutDeletedWords({
                group: group,
                page: page,
                userId,
                token
            }))
            :
            dispatch(fetchWords({
                group: group,
                page: page
            }))
        setIsButtonDisable(false);
    };

    const confirmHandler =  () => {
        setUserWords(words);
        getWords(page, currentGroup);
        setModalIsVisible(false);
        token && dispatch(putStatistics({
            userId,
            stats: {
                "learnedWords": 0,
                "optional": {
                    gamesCount: (gamesCount + 1)
                }
            },
            token
        }));
        link && history.push(`/${link}`);
    };
    const startGameHandler = (linkTo) => {
        setModalIsVisible(true);
        setLink(linkTo);

    };
    return (
        <>
            {
                modalIsVisible && <div className={styles.wrap}>
                    <div className={styles.modal}>
                        <button className={styles.cross} onClick={() => setModalIsVisible(false)}>&#10006;</button>
                        <h4 className={styles.title}>Выберите сложность игры</h4>
                        <div className={styles.list}>
                            {
                                unitItems.map(i => <button
                                    className={styles.button}
                                    key={i.group}
                                    style={{backgroundColor: i.color}}
                                    onClick={() => buttonHandler(i.group - 1)}>{i.group}
                                </button>)
                            }
                        </div>
                        <button
                            onClick={confirmHandler}
                            className={styles.start}
                            disabled={isButtonDisable}
                        >Начать</button>
                    </div>
                </div>
            }
            <main className={styles.main}>
                <Games location={location} match={match} startGameHandler={startGameHandler}/>
            </main>
        </>
    );
}
