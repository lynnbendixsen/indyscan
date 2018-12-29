import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Grid} from 'semantic-ui-react';
import Router from "next/dist/lib/router";


class PageHeader extends Component {

    render() {
        return (
            <div>
                <Grid id="page-header">
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <h1>Hyperldeger Indy Scan</h1>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Navbar currentPath={this.props.currentPath}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

            </div>
        )
    }
}

export default PageHeader;
