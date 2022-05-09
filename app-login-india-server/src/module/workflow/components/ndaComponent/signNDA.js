import React, { Component } from 'react';
import { Col, Container, Row } from 'react-grid-system';
import classes from '../../styles.module.css';
import './styles.css';
import '../../styles.css';
import { Content, Header, Heading, Modal } from 'module/components';
import { PDFDocument } from 'pdf-lib';
import cogoToast from 'cogo-toast';
import { ReactSVG } from 'react-svg';
import { getDomainUrl } from './utils';
import PdfComponent from './pdfComponent';
import { Button, CheckBox, Spinner } from 'veris-styleguide';
import parse from 'html-react-parser';
import SignaturePad from 'react-signature-canvas';
import { withTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import axios from 'axios';
import { replaceAll } from './utils.js';
import moment from 'moment';
import { convertHtmlToPdf } from 'requests';

class SignNda extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ModalActive: false,
            pdfToRender: '',
            loading: false,
            htmlToRender: '',
            autofilled: false,
            showSignComponent: false,
            consentMessage: 'NDA covered under MSA',
            isChecked: false,
        };
    }

    componentDidMount() {
        this.createDisplayData();
    }

    createDisplayData = async () => {
        let { t } = this.props;
        let autofilledValue = this.props.value;//determine validity
        if (autofilledValue) {
            let autofilled = true;
            let pdfToRender = getDomainUrl(autofilledValue);
            const valueArray = autofilledValue?.split?.('@');
            if (valueArray && valueArray.length > 1) {
                const duration = this.props.meta?.valid_duation || 999;
                const version = this.props.meta?.version?.toString() || '1';
                const oldVersion = valueArray.filter((i) => i.startsWith('V-'))?.pop()?.replace('V-', '');
                const oldTimestamp = valueArray.filter((i) => i.startsWith('T-'))?.pop()?.replace('T-', '');
                if (version !== oldVersion || moment().valueOf() > moment(oldTimestamp).add(duration, 'days').valueOf()) {
                    autofilled = false;
                    pdfToRender = '';
                }
            }
            this.setState({ autofilled, pdfToRender });

        } else {
            //fetch current lannguage locale
            let language = localStorage.getItem('currentlanguage');
            const translations = this.props.meta?.translations;
            let url = this.props ? this.props.placeholder : '';
            let consentMessage = t('covered_under_msa');
            console.log('translation nda', translations.hasOwnProperty(language));
            if (!translations.hasOwnProperty(language)) {
                language = 'en';
            }
            if (language && translations && translations[language]) {
                url = translations[language] && translations[language]['url'];
                // consentMessage = translations[language] && translations[language]["consentMessage"];
                consentMessage = t('covered_under_msa');

            }
            if (this.props.meta?.html) {
                try {
                    let { data: htmlString } = await axios.get(getDomainUrl(url));
                    // let htmlString = "Hi first_name last_name";
                    let map = this.props.getcontext();
                    this.setState({
                            htmlToRender: replaceAll(htmlString, map),
                            isHtml: true,
                            consentMessage: consentMessage,
                        },
                        // () => console.log(this.state.htmlToRender, 'HTML')
                    );

                } catch (e) {
                    console.log('error while fetching  NDA', e);
                }
            } else {
                let map = this.props.getcontext();
                this.setState({
                    pdfToRender: getDomainUrl(url),
                    consentMessage: consentMessage,

                });
            }
        }
        setTimeout(() => this.clear(), 1000);
        this.setState({ showSignComponent: this.props.meta?.with_sign_on_portal === true });
    };


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.value !== this.props.value) {
            this.createDisplayData();
        }
    }


    getBlobFromPdf = async () => {
        let pdfDoc = await PDFDocument.create();
        try {
            const existingPdfBytes = await fetch(this.state.pdfToRender)
                .then(res => res.arrayBuffer());
            pdfDoc = await PDFDocument.load(existingPdfBytes);
        } catch (e) {
            console.log('error');
        }
        var d = new Date();
        const page = pdfDoc.addPage();
        if (this.state.showSignComponent) {
            const dataUrl = this.getSignature();
            if (!dataUrl) {
                return false;
            }
            const pngImageBytes = this.base64ToArrayBuffer(dataUrl.split(',')[1].split('"')[0]);
            const pngImage = await pdfDoc.embedPng(pngImageBytes);
            const pngDims = pngImage.scale(0.5);
            const page = pdfDoc.addPage();
            page.drawImage(pngImage, {
                x: page.getWidth() / 2 - pngDims.width / 2,
                y: page.getHeight() / 2 - pngDims.height / 2,
                width: pngDims.width,
                height: pngDims.height,
            });
            page.moveTo(50, 700);
        }
        page.drawText(this.state.consentMessage);
        page.drawText('Dated: ' + moment().format('DD/MMM/YYYY hh:mm:a'));
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        return pdfBlob;
    };


    getBlobFromHtml = async () => {
        let pdfDoc = await PDFDocument.create();
        try {
            const { data } = await convertHtmlToPdf({
                html_string: `${this.state.htmlToRender} ` + `<p>${this.state.consentMessage}</p>` + `<p>Dated:  ${moment().format('DD MMM YYYY hh:mm:a')}</p>`,
            });
            // var blob=new Blob([data]);
            // var link=document.createElement('a');
            // link.href=window.URL.createObjectURL(blob);
            // link.download="dasd.pdf";
            // link.click();

            pdfDoc = await PDFDocument.load(data);
        } catch (e) {
            console.log('error');
        }
        // const page = pdfDoc.addPage();
        if (this.state.showSignComponent) {
            const dataUrl = this.getSignature();
            if (!dataUrl) {
                return false;
            }
            const pngImageBytes = this.base64ToArrayBuffer(dataUrl.split(',')[1].split('"')[0]);
            const pngImage = await pdfDoc.embedPng(pngImageBytes);
            const pngDims = pngImage.scale(0.5);
            const page = pdfDoc.addPage();
            page.drawImage(pngImage, {
                x: page.getWidth() / 2 - pngDims.width / 2,
                y: page.getHeight() / 2 - pngDims.height / 2,
                width: pngDims.width,
                height: pngDims.height,
            });
            page.moveTo(50, 700);
        }
        // await page.drawText("NDA covered under MSA", {
        //     size: 15,
        //     x: 50,
        //     y: 100,
        // });
        // await page.drawText("Dated: " + moment().format("DD MMM YYYY hh:mm:a"), {
        //     size: 15,
        //     x: 50,
        //     y: 150,
        // });
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        return pdfBlob;

    };

    unstable_getBlobFromHtml = () => {
        var doc = new jsPDF('p', 'mm', 'a4'); //("portrait | landscape"," ","size : a0 - a10")
        var elementHandler = {
            '#ignorePDF': function(content, renderer) {
                return true;
            },
        };
        var source = this.state.htmlToRender.replaceAll('“', '"').replaceAll('”', '"').replaceAll('’', '\'').replaceAll('–', ':');
        //document.getElementById("htmlPDF");
        doc.fromHTML(source, 15, 15, { 'width': 180, 'elementHandlers': elementHandler });
        /* jspdf - @1.3.3 later version dependency not clear */
        doc.addPage('a4', 'p');
        var d = new Date();
        const textName = this.state.consentMessage;
        const textDate = 'Dated: ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();

        if (this.state.showSignComponent) {
            const dataUrl = this.getSignature();
            if (!dataUrl) {
                return false;
            }
            const imgData = this.base64ToArrayBuffer(dataUrl.split(',')[1].split('"')[0]);
            doc.addImage(imgData, 'PNG', 40, 85, 40, 40);
        }
        doc.text(textName, 15, 15, { align: 'left' });
        doc.text(textDate, 15, 30, { align: 'left' });
        const pdfBlob = doc.output('blob', 'myfile.pdf');
        return pdfBlob;
    };

    clear = () => {
        if (this.sigPad) {
            this.sigPad.clear && this.sigPad.clear();
        }
    };

    base64ToArrayBuffer = (base64) => {
        var binaryString = window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var i = 0; i < binaryLen; i++) {
            var ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    };

    getSignature = () => {
        if (this.sigPad.isEmpty()) {
            this.setState({ sign_error: true });
            return false;
        } else {
            let signData = this.sigPad.getTrimmedCanvas().toDataURL('image/png');
            this.setState({ trimmedDataURL: signData, sign_error: false });
            return signData;
        }
    };

    onSubmit = async (dataUrl) => {
        const { t } = this.props;
        try {
            this.props.onFocus();
            await this.createDisplayData();
            this.setState({ loading: true, showLoader: true, showError: false });
            if (!this.state.isChecked) {
                cogoToast.error('Please select the checkbox to proceed');

            } else if (!this.props.autofilled) {
                let blob = await (this.state.isHtml ? this.getBlobFromHtml() : this.getBlobFromPdf());
                if (!blob) {
                    return this.setState({ showLoader: false, showError: true });
                }
                await this.props.onChange(blob);
                this.setState({ loading: false, showLoader: false, ModalActive: false });
                cogoToast.success(t('PDF Uploaded Successfully !'));
            }
        } catch (e) {
            this.setState({ loading: false, showLoader: false, showError: true, ModalActive: false });
            cogoToast.error(t('PDF upload failed !'));
            console.log('error in pdf upload', e);
        }
    };

    renderFieldView = () => {
        const { t } = this.props;
        return (
            <>
                <div className='vrs-label'>
                    {this.props.label || 'NDA'} {this.props.isRequired ? ' *' : ''}
                </div>
                <div className={'col-md-12'}>
                    <div className='btn-NDA-View'>
                        {this.state.autofilled
                            ?
                            <button id='gdprView' theme='vrs-btn-primary' tooltip={t('activityDetails.h-view-details')}
                                    onClick={() => {
                                        this.props.onFocus();
                                        this.setState({ ModalActive: true });
                                    }}>
                                {t('activityDetails.l-nda-autofilled')}
                                <div className='InformationIconDiv'>
                                    <ReactSVG
                                        beforeInjection={svg => {
                                            svg.firstElementChild.innerHTML = '';
                                            svg.classList.add('IconInformation');
                                        }}

                                        src={'/assets/icons/information-circle.svg'}
                                    />
                                </div>
                            </button>
                            :
                            <>
                                <button
                                    id='gdprAccept'
                                    theme='vrs-btn-primary'
                                    onClick={() => {
                                        this.createDisplayData();
                                        this.setState({ ModalActive: true });
                                    }}>
                                    {this.state.loading &&
                                        <span style={{ marginRight: '4px' }}><Spinner color='#018ccf'
                                                                                      size={15} /></span>}
                                    {t('activityDetails.l-nda-read-accept')}
                                    <ReactSVG
                                        beforeInjection={svg => {
                                            svg.firstElementChild.innerHTML = '';
                                            svg.classList.add('IconInformation');
                                        }}
                                        src={'/assets/icons/information-circle.svg'}
                                    />
                                </button>
                                {!this.state.loading &&
                                    <CheckBox
                                        label={t('covered_under_msa')}
                                        disabled={this.props.meta?.mandatory_sign}
                                        checked={this.state.isChecked}
                                        onClick={(event) => {
                                            this.setState({
                                                    isChecked: !this.state.isChecked,
                                                }, () => {
                                                    console.log(this.state.isChecked);
                                                    if (this.state.isChecked) {
                                                        this.onSubmit();
                                                    }
                                                },
                                            );
                                        }}
                                    />}
                            </>
                        }
                        {this.props.error && <div className='vrs-error'>{this.props.error}</div>}
                    </div>

                </div>
            </>);
    };
    renderModalView = () => {
        const { t } = this.props;
        const { autofilled, isHtml, consentMessage, showSignComponent } = this.state;
        return (
            <Container className={classes.SubContainer + ' SingleActivity'}>
                <Row>
                    <Col sm={12} md={12} lg={12}>
                        <Modal className='Modal' style={{ width: '100%' }}>
                            <Header heading={<Heading name={this.props.label} />}
                                    handleClose={() => this.setState({ ModalActive: false })} />
                            <Content>

                                {autofilled
                                    ? <PdfComponent filePath={this.state.pdfToRender} />
                                    : <>
                                        {isHtml
                                            ? <div id='htmlPDF' className='htmlShow' style={{
                                                flex: 1,
                                                textAlign: 'left',
                                                marginTop: '1em',
                                                padding: '0 15px 0 15px',
                                                marginVertical: '2em',
                                                alignSelf: 'center',
                                                // listStylePosition:"inside",
                                                // display: "list-item"
                                            }}>
                                                {parse(this.state.htmlToRender)}
                                            </div>
                                            : <PdfComponent filePath={this.state.pdfToRender} />}
                                        <Col sm={12} md={12} lg={12} className={classes.Column}>
                                            {consentMessage && consentMessage.length > 0 &&
                                                <div style={{ display: 'flex', justifyContent: 'left' }}>
                                                    <CheckBox
                                                        disabled={this.props.meta?.mandatory_sign}
                                                        label={this.state.consentMessage}
                                                        placeholder={this.state.consentMessage}
                                                        checked={this.state.isChecked}
                                                        onClick={() => this.setState({

                                                            isChecked: !this.state.isChecked,
                                                        })}
                                                    />
                                                </div>}
                                            {showSignComponent &&
                                                <>
                                                    <div className={'col-md-12 sigContainer'}>
                                                        <SignaturePad ref={(ref) => {
                                                            this.sigPad = ref;
                                                        }} penColor='steelblue'
                                                                      canvasProps={{ className: 'sigCanvas' }} />
                                                    </div>
                                                    <div className='width-100-percent'>
                                                        <Button type='button' theme='vrs-btn-secondry'
                                                                loading={this.state.loading}
                                                                label={t('invitesSingle.btn-clear')}
                                                                tooltip={t('invitesSingle.btn-clear')}
                                                                className='btn clear_sign_btn' onClick={this.clear} />
                                                    </div>
                                                    {this.state.sign_error &&
                                                        <p className='warning_sign m-l-3em'>{t('text.nda-signed')}</p>}
                                                </>}
                                            {
                                                !autofilled && !this.props.meta?.mandatory_sign &&
                                                <div className='width-100-percent'>
                                                    <Button
                                                        loading={this.state.loading}
                                                        type='button' theme='vrs-btn-primary' label={t('btn.submit')}
                                                        tooltip={t('btn.submit')}
                                                        className='btn submit_sign_btn'
                                                        onClick={() => {
                                                            this.onSubmit();
                                                        }} />
                                                </div>
                                            }
                                        </Col>
                                    </>
                                }
                            </Content>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        );
    };

    render() {
        if (!this.state.ModalActive) {
            return this.renderFieldView();
        }
        return this.renderModalView();
    }
}

export default withTranslation()(SignNda);
