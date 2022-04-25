import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Icon from "@material-ui/core/Icon";
import { list } from "./api-product.js";
import Products from "./Products";
import { TablePagination } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    background: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: "nowrap",
    width: "100%",
    transform: "translateZ(0)",
  },
  tileTitle: {
    verticalAlign: "middle",
    lineHeight: 2.5,
    textAlign: "center",
    fontSize: "1.35em",
    margin: "0 4px 0 0",
  },
  card: {
    margin: "auto",
    marginTop: 20,
  },
  title: {
    padding: `${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(
      2
    )}px`,
    color: "blue",
    backgroundColor: "white",
    fontSize: "1.1em",
    textAlign: "center",
  },
  icon: {
    verticalAlign: "sub",
    color: "black",
    fontSize: "0.9em",
  },
  link: {
    cursor: "pointer",
    color: "black"
  },
}));

export default function Categories(props) {
  const classes = useStyles();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(props.selectedCategory);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [totalProducts, setTotalProducts] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const category = selected || props.selectedCategory;
    const query = {
      itemsPerPage: rowsPerPage,
      pageNumber: pageNumber + 1,
      category,
    };

    list(query).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        const { products, numberOfPages, totalNumberOfDocuments } = data;
        setProducts(products);
        setTotalPages(numberOfPages);
        setTotalProducts(totalNumberOfDocuments);
      }
    });
    return function cleanup() {
      abortController.abort();
    };
  }, [pageNumber, rowsPerPage, selected]);

  const handlePageChange = (e, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (e, newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage.props.value);
    setPageNumber(0);
  };

  const listbyCategory = (category) => (event) => {
    setSelected(category);
    setPageNumber(0);
  };

  return (
    <div>
      <Card className={classes.card}>
        <Typography type="title" className={classes.title}>
          Search by Category
        </Typography>
        <div className={classes.root}>
          <GridList className={classes.gridList} cols={4}>
            {props.categories?.map((tile, i) => (
              <GridListTile
                key={i}
                className={classes.tileTitle}
                style={{
                  height: "64px",
                  backgroundColor:
                    selected == tile
                      ? "#a5c514"
                      : "#a5c514",
                }}
              >
                <span className={classes.link} onClick={listbyCategory(tile)}>
                  {tile}{" "}
                  <Icon className={classes.icon}>
                    {selected == tile && "arrow_drop_down"}
                  </Icon>
                </span>
              </GridListTile>
            ))}
          </GridList>
        </div>
        <Divider />
        <Products products={products} searched={false} />
      </Card>
      {/* <TablePagination
        labelRowsPerPage="Items Per Page"
        component="div"
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        count={totalProducts}
        page={pageNumber}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10]}
      /> */}
    </div>
  );
}
Categories.propTypes = {
  categories: PropTypes.array.isRequired,
};
