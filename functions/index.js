
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { FieldPath } = require('@google-cloud/firestore');

const serviceAccount = require("./bon-kapal-firebase-adminsdk-ymrhu-be80b70919.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bon-kapal.firebaseio.com"
});

const lightRuntime = {
    timeoutSeconds: 120,
    memory: '256MB'
}

const heavyRuntime = {
    timeoutSeconds: 300,
    memory: '512MB'
}

function createDate() {
    const now = new Date();

    let thisYear = now.getFullYear().toString();
    let thisMonth = (now.getMonth() + 1).toString();
    let thisDate = now.getDate().toString();

    if (thisMonth.length === 1) {
        thisMonth = '0' + thisMonth;
    }

    if (thisDate.length === 1) {
        thisDate = '0' + thisDate;
    }

    return `${thisYear}${thisMonth}${thisDate}`;
}


exports.addShip     = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const newShipDoc = admin.firestore().collection('ship').doc(data.shipName);

    try {
        const docSnapshot = await newShipDoc.get();

        let responseObj = {};

        if (docSnapshot.exists) {
            responseObj = { responseText: 'Nama Kapal tersebut sudah digunakan sebelumnya! Pilih nama kapal baru!', error: 1 };
        } else {
            await newShipDoc.set({
                lastUp: (new Date()).valueOf(),
                isum: 0,
                osum: 0,
                lastBook: '',
            }, { merge: true });

            responseObj = { responseText: 'Kapal Berhasil Ditambahkan!', error: 0 };
        }

        return responseObj;
    } catch (err) {
        throw new functions.https.HttpsError('unavailable', 'Terjadi kesalahan ketika menyimpan nama kapal! Coba lagi dalam beberapa saat!');
    }
});

exports.getShips    = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const shipRef = admin.firestore().collection('ship');

    try {
        const querySnapshot = await shipRef.get();
        let shipList = [];
        let responseObj = { isEmpty: true, shipList: [] };

        if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => shipList.push(doc.id));

            responseObj = { isEmpty: false, shipList: shipList };
        }

        return responseObj;
    } catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika membaca nama-nama kapal!')
    }
});

exports.getBooks    = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const booksRef = admin.firestore().collection('ship').doc(data.shipName).collection('book');

    try {
        const bookQuery = await booksRef.get();

        const bookArr = [];

        if (!bookQuery.empty) {
            bookQuery.forEach(book => {
                bookArr.push({
                    startDate: book.data().startDate,
                    endDate: book.data().endDate,
                    isum: book.data().isum,
                    osum: book.data().osum,
                });
            });
        }

        return { books: bookArr };
    } catch (error) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika mengambil daftar buku! Coba lagi dalam beberapa saat!', err.message);
    }
});

exports.openBook    = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const shipRef = admin.firestore().collection('ship').doc(data.shipName);

    const chosenBook = data.chosenBook;

    let bonRef;

    if (chosenBook.startDate === '') {
        bonRef = shipRef.collection('bon')
            .where(admin.firestore.FieldPath.documentId(), '<=', chosenBook.endDate);
    } else {
        bonRef = shipRef.collection('bon')
            .where(admin.firestore.FieldPath.documentId(), '>', chosenBook.startDate)
            .where(admin.firestore.FieldPath.documentId(), '<=', chosenBook.endDate);
    }

    const bonQuery = await bonRef.get();
    const iQuery = await bonRef.firestore.collectionGroup('i').get();
    const oQuery = await bonRef.firestore.collectionGroup('o').get();

    const dateArr = bonQuery.docs;
    const iArr = iQuery.docs;
    const oArr = oQuery.docs;

    let tempMap = new Map();

    for (const dateDoc of dateArr) {
        let dateList = [];
        const dateKey = dateDoc.id;

        for (const iData of iArr) {
            if (iData.ref.parent.parent.id === dateKey) {
                dateList.push({
                    docId: iData.id,
                    type: 'i',
                    info: iData.data().info,
                    amount: iData.data().amount,
                });
            }
        }

        for (const oData of oArr) {
            if (oData.ref.parent.parent.id === dateKey) {
                dateList.push({
                    docId: oData.id,
                    type: 'o',
                    info: oData.data().info,
                    amount: oData.data().amount,
                });
            }
        }

        tempMap.set(dateKey, dateList);
    }

    return { resultData: Array.from(tempMap) };
});

exports.aggrBon = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const shipRef = admin.firestore().collection('ship').doc(data.shipName);

    try {
        const [dateArr, iArr, oArr, greenSum, redSum] = await admin.firestore().runTransaction(async (transaction) => {
            const shipDoc = await transaction.get(shipRef);
            const shipData = shipDoc.data();
            const startDate = shipData.lastBook;
            const endDate = createDate();
            let bonRef;
            if (startDate === '') {
                bonRef = shipRef.collection('bon')
                    .where(admin.firestore.FieldPath.documentId(), '<=', endDate);
            }
            else {
                bonRef = shipRef.collection('bon')
                    .where(admin.firestore.FieldPath.documentId(), '>', startDate)
                    .where(admin.firestore.FieldPath.documentId(), '<=', endDate);
            }
            const bonQuery = await bonRef.get();
            if (bonQuery.empty) {
                transaction.set(shipRef, shipData);
                return [[], [], [], 0, 0];
            }
            const iQuery = bonRef.firestore.collectionGroup('i').orderBy(FieldPath.documentId()).startAt(shipRef.path).endAt(shipRef.path + "\uf8ff");
            const oQuery = bonRef.firestore.collectionGroup('o').orderBy(FieldPath.documentId()).startAt(shipRef.path).endAt(shipRef.path + "\uf8ff");
            const [iDocs, oDocs] = await Promise.all([
                iQuery.get(),
                oQuery.get(),
            ]);

            await transaction.set(shipRef, {
                isum: 0,
                osum: 0,
                lastUp: (new Date()).valueOf(),
                lastBook: endDate,
            }, { merge: true });

            if(data.save){
                const bookRef = shipRef.collection('book');
                await transaction.set(bookRef.doc(endDate), {
                    startDate: startDate,
                    endDate: endDate,
                    isum: shipData.isum,
                    osum: shipData.osum,
                }, { merge: true });
                await transaction.set(shipRef, {
                    isum: 0,
                    osum: 0,
                    lastUp: (new Date()).valueOf(),
                    lastBook: endDate,
                }, { merge: true });
            } else {
                await transaction.set(shipRef, shipData);
            }
            return [bonQuery.docs, iDocs.docs, oDocs.docs, shipData.isum, shipData.osum];
        });

        let isEmpty = true;
        let tempArr = [];
        if (dateArr.length > 0) {
            let tempMap = new Map();
            for (const dateDoc of dateArr) {
                let dateList = [];
                const dateKey = dateDoc.id;
                for (const iData of iArr) {
                    if (iData.ref.parent.parent.id === dateKey) {
                        dateList.push({
                            docId: iData.id,
                            type: 'i',
                            info: iData.data().info,
                            amount: iData.data().amount,
                        });
                    }
                }
                for (const oData of oArr) {
                    if (oData.ref.parent.parent.id === dateKey) {
                        dateList.push({
                            docId: oData.id,
                            type: 'o',
                            info: oData.data().info,
                            amount: oData.data().amount,
                        });
                    }
                }
                tempMap.set(dateKey, dateList);
            }
            tempArr = Array.from(tempMap);
            isEmpty = false;
        }
        return { isEmpty: isEmpty, resultData: tempArr, incomeSum: greenSum, expenseSum: redSum };
    }
    catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika menutup buku! Coba lagi dalam beberapa saat!', err.message);
    }
});

exports.addBon      = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const firestore = admin.firestore();
    const shipRef = firestore.collection('ship').doc(data.shipName);
    const aggregationRef = shipRef.collection('aggr').doc(data.year);
    const dateRef = shipRef.collection('bon').doc(data.fullDate);

    const transactionType = data.isIncome ? 'i' : 'o';
    const newRef = dateRef.collection(transactionType).doc();

    try {
        await firestore.runTransaction(async (transaction) => {
            const [shipDoc, aggregationDoc, dateDoc] = await Promise.all([
                transaction.get(shipRef),
                transaction.get(aggregationRef),
                transaction.get(dateRef),
            ]);
            let aggregationValue;
            if (aggregationDoc.exists) {
                aggregationValue = aggregationDoc.data();
            }
            else {
                let newArr = [];
                for (let i = 0; i < 13; i++) {
                    newArr.push({
                        isum: 0,
                        osum: 0,
                    });
                }
                aggregationValue = {
                    isum: 0,
                    osum: 0,
                    lastUp: 0,
                    months: newArr,
                };
            }

            let shipValue = shipDoc.data();
            let dateValue = dateDoc.exists ? dateDoc.data() : { isum: 0, osum: 0, lastUp: 0 };

            const lastUp = (new Date()).valueOf();

            const newEntry = {
                lastUp: lastUp,
                amount: data.amount,
                info: data.info,
            };

            if (data.isIncome) {
                shipValue.isum += data.amount;
                dateValue.isum += data.amount;
                aggregationValue.isum += data.amount;
                aggregationValue.months[parseInt(data.month, 10)].isum += data.amount;
            }
            else {
                shipValue.osum += data.amount;
                dateValue.osum += data.amount;
                aggregationValue.osum += data.amount;
                aggregationValue.months[parseInt(data.month, 10)].osum += data.amount;
            }

            shipValue.lastUp = lastUp;
            dateValue.lastUp = lastUp;
            aggregationValue.lastUp = lastUp;

            transaction.set(shipRef, shipValue, { merge: true });
            transaction.set(aggregationRef, aggregationValue, { merge: true });
            transaction.set(dateRef, dateValue, { merge: true });
            transaction.set(newRef, newEntry, { merge: true });
            return Promise.resolve(true);
        });
        return { transactionSuccess: true, message: 'Bon Berhasil Ditambahkan!' };
    }
    catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika menambahkan bon! Coba lagi dalam beberapa saat!', err.message);
    }
});

exports.getBons     = functions.region('asia-east2').runWith(heavyRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const bonsRef = admin.firestore().collection('ship').doc(data.shipName).collection('bon').orderBy(admin.firestore.FieldPath.documentId(), 'asc')
        .where(admin.firestore.FieldPath.documentId(), '>=', data.startDate)
        .where(admin.firestore.FieldPath.documentId(), '<=', data.endDate);

    try {
        const bonsQuery = await bonsRef.get();
        let tempMap = new Map();

        const mapInsertion = await Promise.all(bonsQuery.docs.map(async doc => {
            const [iCollection, oCollection] = await Promise.all([
                doc.ref.collection('i').get(),
                doc.ref.collection('o').get(),
            ]);

            const iArr = iCollection.docs.map(doc => {
                return [doc.id, doc.data()];
            });

            const oArr = oCollection.docs.map(doc => {
                return [doc.id, doc.data()];
            })

            tempMap.set(doc.id, {
                ...doc.data(),
                i: iCollection.size === 0 ? [] : iArr,
                o: oCollection.size === 0 ? [] : oArr,
            });

            return Promise.resolve(true);
        }));

        if (mapInsertion.includes(false)) {
            throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika membaca daftar bon! Coba lagi dalam beberapa saat!', err.message);
        }

        return { bons: Array.from(tempMap) };
    } catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika membaca daftar bon! Coba lagi dalam beberapa saat!', err.message);
    }

});

exports.editBon     = functions.region('asia-east2').runWith(lightRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const docDate = data.documentDate;
    const transactionType = data.transactionType;

    const newAmount = data.newAmount;

    const shipRef = admin.firestore().collection('ship').doc(data.shipName);
    const aggregationRef = shipRef.collection('aggr').doc(docDate.substring(0, 4));
    const dateRef = shipRef.collection('bon').doc(docDate);
    const bonRef = dateRef.collection(transactionType).doc(data.documentId);

    try {
        await admin.firestore().runTransaction(async transaction => {
            const [shipDoc, aggregationDoc, dateDoc, bonDoc] = await Promise.all([
                transaction.get(shipRef),
                transaction.get(aggregationRef),
                transaction.get(dateRef),
                transaction.get(bonRef),
            ]);

            if (!aggregationDoc.exists || !dateDoc.exists || !bonDoc.exists || !shipDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Bon yang ingin diubah tidak dapat ditemukan!');
            }

            let shipValue = shipDoc.data();
            let aggregationValue = aggregationDoc.data();
            let dateValue = dateDoc.data();
            let bonValue = bonDoc.data();


            if (data.add) {
                const amountDiff = newAmount - bonValue.amount;

                if (transactionType === 'i') {
                    shipValue.isum += amountDiff;
                    aggregationValue.isum += amountDiff;
                    aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].isum += amountDiff;
                    dateValue.isum += amountDiff;
                } else if (transactionType === 'o') {
                    shipValue.osum += amountDiff;
                    aggregationValue.osum += amountDiff;
                    aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].osum += amountDiff;
                    dateValue.osum += amountDiff;
                }
            } else {
                const amountDiff = bonValue.amount - newAmount;

                if (transactionType === 'i') {
                    shipValue.isum -= amountDiff;
                    aggregationValue.isum -= amountDiff;
                    aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].isum -= amountDiff;
                    dateValue.isum -= amountDiff;
                } else if (transactionType === 'o') {
                    shipValue.osum -= amountDiff;
                    aggregationValue.osum -= amountDiff;
                    aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].osum -= amountDiff;
                    dateValue.osum -= amountDiff;
                }
            }

            bonValue.info = data.newInfo;
            bonValue.amount = newAmount;

            const lastUp = (new Date()).valueOf();

            shipValue.lastUp = lastUp;
            aggregationValue.lastUp = lastUp;
            dateValue.lastUp = lastUp;
            bonValue.lastUp = lastUp;

            transaction.set(shipRef, shipValue, { merge: true });
            transaction.set(aggregationRef, aggregationValue, { merge: true });
            transaction.set(dateRef, dateValue, { merge: true });
            transaction.set(bonRef, bonValue, { merge: true });
        });

        return { responseText: 'Bon Berhasil Diubah!' };
    } catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika mengubah bon! Coba lagi dalam beberapa saat!', err.message);
    }
});

exports.deleteBon   = functions.region('asia-east2').runWith(heavyRuntime).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Anda harus login terlebih dahulu!');
    }

    const transactionType = data.transactionType;
    const docDate = data.documentDate;

    const shipRef = admin.firestore().collection('ship').doc(data.shipName);
    const aggregationRef = shipRef.collection('aggr').doc(docDate.substring(0, 4));
    const dateRef = shipRef.collection('bon').doc(docDate);
    const bonRef = dateRef.collection(transactionType).doc(data.documentId);

    try {
        await admin.firestore().runTransaction(async transaction => {
            const [shipDoc, aggregationDoc, dateDoc, bonDoc] = await Promise.all([
                transaction.get(shipRef),
                transaction.get(aggregationRef),
                transaction.get(dateRef),
                transaction.get(bonRef),
            ]);

            if (!shipDoc.exists || !aggregationDoc.exists || !dateDoc.exists || !bonDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Bon yang dipilih tidak valid!');
            }

            let shipValue = shipDoc.data();
            let aggregationValue = aggregationDoc.data();
            let dateValue = dateDoc.data();
            const bonValue = bonDoc.data();

            if (transactionType === 'i') {
                shipValue.isum -= bonValue.amount;
                aggregationValue.isum -= bonValue.amount;
                aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].isum -= bonValue.amount;
                dateValue.isum -= bonValue.amount;
            } else {
                shipValue.osum -= bonValue.amount;
                aggregationValue.osum -= bonValue.amount;
                aggregationValue.months[parseInt(docDate.substring(4, 6), 10)].osum -= bonValue.amount;
                dateValue.osum -= bonValue.amount;
            }

            const lastUp = (new Date()).valueOf();

            aggregationValue.lastUp = lastUp;
            dateValue.lastUp = lastUp;
            shipValue.lastUp = lastUp;

            transaction.update(shipRef, shipValue);
            transaction.update(aggregationRef, aggregationValue);

            transaction.delete(bonRef);

            if (dateValue.isum === 0 && dateValue.osum === 0) {
                transaction.delete(dateRef);
            } else {
                transaction.update(dateRef, dateValue);
            }
        });

        return { responseText: 'Bon berhasil dihapus!' };
    } catch (err) {
        throw new functions.https.HttpsError('unknown', 'Terjadi kesalahan ketika menghapus bon! Coba lagi dalam beberapa saat!', err.message);
    }
});