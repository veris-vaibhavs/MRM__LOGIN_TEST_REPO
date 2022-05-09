import React, { Component } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './styles.css';
import '../../styles.css';
import { IconContext } from 'react-icons';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { withTranslation } from 'react-i18next';


class PdfComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            pageNumber: 1,
            pdfloadError: false,
        };
    }

    onDocumentLoad = ({ numPages }) => {
        this.setState({ numPages, isLoading: false });
    };

    componentDidMount() {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    }

    render() {
        const { t } = this.props;
        const { pageNumber, numPages } = this.state;
        return (
            <div>
                <div>
                    <Document
                        file={this.props.filePath}
                        onLoadSuccess={this.onDocumentLoad}
                    >
                        <Page pageNumber={pageNumber} />
                    </Document>
                </div>
                <div className={'pdfBottomNavigation'}>
                    {
                        this.state.pageNumber !== 1 &&
                        <IconContext.Provider
                            value={{
                                color: '#blue',
                                size: 24,
                                className: 'next_btn',
                                style: { marginRight: '0.5em' },
                            }}>

                            <FaAngleLeft onClick={() => {
                                this.setState({
                                    pageNumber: Math.max(this.state.pageNumber - 1, 1),
                                });
                            }} />
                        </IconContext.Provider>
                    }
                    <p> Page {this.state.pageNumber} of {this.state.numPages}</p>
                    {(this.state.pageNumber !== this.state.numPages) &&
                        <IconContext.Provider
                            value={{
                                color: '#blue',
                                size: 24,
                                className: 'next_btn',
                                style: { marginLeft: '0.5em' },
                            }}>
                            <FaAngleRight onClick={() => {
                                this.setState({
                                    pageNumber: Math.min(this.state.pageNumber + 1, this.state.numPages),
                                });
                            }} />
                        </IconContext.Provider>
                    }
                </div>
            </div>
        );
    }
}

export default withTranslation()(PdfComponent);
