
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from '@mui/styles';
// import withStyles from '@mui/styles';
import { useState } from 'react';
import db from "../../firebase";
import { useEffect } from 'react';
import { TxStatus } from '../Transaction/Transaction';
import { v4 as uuid } from 'uuid';


const columns = [
    { id: 'status', label: 'Status', minWidth: 80 },
    { id: 'amount', label: 'Amout', minWidth: 80, },
    { id: 'txHash', label: 'TxHash', minWidth: 50 },
    { id: 'from', label: 'From', minWidth: 50 },
    { id: 'to', label: 'To', minWidth: 100 },
];

function createData(id, timestamp, txHash, from, to, amount, status) {
    return { id, timestamp, txHash, from, to, amount, status };
}

export default function TxHistory() {
    const classes = useStyles();

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [data, setData] = useState([]);

    const ref = db.collection("Transactions")

    function updateList() {
        ref.onSnapshot((querySnapshot) => {
            const items = [];

            querySnapshot.forEach((doc) => {
                let status = ""

                if (doc.data().status === TxStatus.PENDING) {
                    status = "⏱️ Pending"
                } else if (doc.data().status === TxStatus.SUCCESS) {
                    status = "✅ Success"
                } else if (doc.data().status === TxStatus.FAILED) {
                    status = "❌ Failed"
                }
                items.push(createData(uuid(), doc.data().date.seconds, doc.data().txHash, doc.data().from, doc.data().to, doc.data().amount, status));

            });

            items.sort((a, b) => {
                return b.timestamp - a.timestamp;
            });

            setData(items);
        })
    }

    useEffect(() => {
        updateList()
    })

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    return (

        <Paper sx={{ "&:hover": { boxShadow: "0px 0px 10px 10px rgba(255, 255, 255, 0.12)" } }} className={classes.root}>
            <TableContainer  >
                <Table aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold", fontSize: "18px" }}
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody >
                        {data
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell sx={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }} 
                                                key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                sx={{ color: "#FFFFFF", fontWeight: "bold", fontSize: "16px" }}
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        background: 'linear-gradient(45deg, #0D111C 20%, #0D111C 80%)',

        border: "1px solid grey",

        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        width: '90%',
        padding: '20px',
        margin: '30px',
    },
});