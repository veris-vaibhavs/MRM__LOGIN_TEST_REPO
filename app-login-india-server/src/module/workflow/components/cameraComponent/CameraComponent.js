import React from 'react';
import Webcam from 'react-webcam';
import cogoToast from 'cogo-toast';
import { Col, Container, Row } from 'react-grid-system';
import classes from '../../styles.module.css';
import { Button } from 'veris-styleguide';
import { Content, Header, Heading, Modal } from 'module/components';
import './CamerStyleing.css';
import { withTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';

let PLACEHOLDER_REFUSE = 'data:image/png;base64,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';
let PLACEHOLDER_SKIP = 'data:image/png;base64,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';

class CameraComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            ModalActive: false,
            imageClicked: false,
            clickedImage: null,
            allow_retake: false,
            allow_skip: true,
            allow_refuse: true,
            allow_upload: true,
        };
    }

    handleClose = () => {
        this.setState({
            ModalActive: false,
        });
    };
    setRef = webcam => {
        this.webcam = webcam;
    };

    componentDidMount() {
        if (this.props.value) {
            this.setState({
                clickedImage: this.props.value,
                imageClicked: true,
            });
        }
        if (this.props.meta?.portal) {
            this.setState({
                allow_retake: this.props.meta?.portal?.allow_retake,
                allow_skip: this.props.meta?.portal?.allow_skip,
                allow_refuse: this.props.meta?.portal?.allow_refuse,
                allow_upload: this.props.meta?.portal?.allow_upload,
            });
        }
    }

    capture = () => {
        console.log('Click Picture');
        const imageSrc = this.webcam.getScreenshot();
        this.setState({
            clickedImage: imageSrc,
            imageClicked: true,
        });
    };
    uploadPicture = () => {
        this.props.onFocus();
        document.getElementById('camera_btn_fallback')
            .click();
    };
    pictureUploaded = async (e) => {
        console.log('Clicked Image');
        let temp = await this.toBase64(e.target.files[0]);
        this.setState({
            clickedImage: temp,
            imageClicked: true,
        });
    };
    takeAgain = () => {
        this.setState({
            clickedImage: null,
            imageClicked: false,
        });
    };

    toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    renderCaptureButton = () => {
        const { t } = this.props;
        return (<Button id='profilePic'
                        theme='vrs-btn-primary'
                        label={t('btn.pic-click')}
                        onClick={this.capture} />);
    };

    renderRetakeButton = () => {
        const { t } = this.props;
        return (<Button
            id='takeAgainPic'
            theme='vrs-btn-primary'
            label={t('btn.pic-click-again')}
            onClick={this.takeAgain}
        />);
    };
    renderRefuseButton = () => {
        const { t } = this.props;
        return (<Button
            id='RefusePic'
            loading={this.state.loading}
            theme='vrs-btn-primary refuse-red'
            label={t('Refuse')}
            onClick={async () => {
                this.setState({
                    clickedImage: PLACEHOLDER_REFUSE,
                    imageClicked: true,
                });
            }}
        />);
    };
    renderSkipButton = () => {
        const { t } = this.props;
        return (<Button
            id='SkipPic'
            loading={this.state.loading}
            theme='vrs-btn-primary skip-grey'
            label={'Skip'}
            onClick={async () => {
                this.setState({
                    clickedImage: PLACEHOLDER_SKIP,
                    imageClicked: true,
                });
            }}
        />);
    };
    renderUploadButton = () => {
        const { t } = this.props;
        return (<Button id='UploadPic'
                        theme='vrs-btn-primary'
                        label={t('btn.pic-click-upload')}
                        onClick={this.uploadPicture} />);

    };
    renderSubmitButton = () => {
        const { t } = this.props;
        return (<Button
            id='ContinueWithPic'
            loading={this.state.loading}
            theme='vrs-btn-primary'
            label={t('btn.pic-click-use')}
            onClick={async () => {
                this.setState({
                    loading: true,
                });
                if (!this.state.clickedImage?.includes('http')) {
                    await this.props.onChange(this.state.clickedImage);
                }
                this.setState({
                    loading: false,
                });
                cogoToast.success(t('Successfully Uploaded'));
                this.handleClose();
            }}
        />);
    };

    render() {
        const { t } = this.props;

        const { allow_retake, allow_skip, allow_refuse, allow_upload } = this.state;
        const videoConstraints = {
            width: 400,
            height: 320,
            facingMode: 'user',
        };
        return (
            <>
                {
                    this.state.ModalActive === true ?
                        <Container className={classes.SubContainer}>
                            <Row>
                                <Col sm={12} md={12} lg={12}>


                                    <Modal className='Modal' style={{ width: '100%' }}>
                                        <Header
                                            heading={
                                                <Heading
                                                    name={this.props.label || 'WebCam'}
                                                />
                                            }
                                            handleClose={this.handleClose}
                                        />
                                        <Content>
                                            {
                                                this.state.imageClicked === false ?
                                                    <div className={'col-md-12 text-center'}>
                                                        <div className={'webcamWrapprer'}>
                                                            <Webcam
                                                                audio={false}
                                                                height={350}
                                                                ref={this.setRef}
                                                                screenshotFormat='image/jpeg'
                                                                width={350}
                                                                videoConstraints={videoConstraints}
                                                            />
                                                        </div>
                                                        {this.props?.actionButtons !== 'no' ?
                                                            <div className={'CameraBtn'}>
                                                                {allow_upload && this.renderUploadButton()}
                                                                {allow_skip && this.renderSkipButton()}
                                                                {allow_refuse && this.renderRefuseButton()}
                                                                {this.renderCaptureButton()}
                                                            </div> : ''}
                                                        <input type='file' id='camera_btn_fallback'
                                                               style={{
                                                                   visibility: 'hidden',
                                                                   position: 'absolute',
                                                                   bottom: '0',
                                                               }} accept='image/*'
                                                               onChange={this.pictureUploaded}
                                                        />
                                                    </div>
                                                    :
                                                    <div className={'col-md-12 text-center PictureContainer'}>
                                                        <div className={'PictureWrapper'}>
                                                            <img src={this.state.clickedImage}
                                                                 alt='Preview Image' />
                                                        </div>
                                                        {this.props?.actionButtons !== 'no' ?
                                                            <div className={'CameraActionBtn'}>
                                                                {allow_retake && this.renderRetakeButton()}
                                                                {this.renderSubmitButton()}
                                                            </div> : ''}
                                                    </div>
                                            }
                                        </Content>
                                    </Modal>
                                </Col>
                            </Row>
                        </Container>
                        :
                        <div>
                            {
                                this.props.value ?
                                    <>
                                        <div className='vrs-label'>
                                            {this.props.label || 'User Profile Picture'}
                                        </div>
                                        <button
                                            id='clickPicture'
                                            theme='vrs-btn-primary'
                                            onClick={() => {
                                                this.setState({ ModalActive: true });
                                            }}
                                        >
                                            <div className='CameraIconDiv'>
                                                <ReactSVG
                                                    beforeInjection={svg => {
                                                        svg.firstElementChild.innerHTML = '';
                                                        svg.classList.add('IconCamera');
                                                    }}

                                                    src={'/assets/icons/single-neutral-circle.svg'}
                                                />
                                            </div>
                                            View Picture
                                        </button>
                                    </>
                                    :
                                    <>
                                        <div className='vrs-label'>
                                            {this.props.label || 'User Profile Picture'}
                                        </div>
                                        <button
                                            id='clickPicture'
                                            theme='vrs-btn-primary'
                                            onClick={() => {
                                                this.props.onFocus();
                                                this.setState({ ModalActive: true });
                                            }}
                                        >
                                            <div className='CameraIconDiv'>
                                                <ReactSVG
                                                    beforeInjection={svg => {
                                                        svg.firstElementChild.innerHTML = '';
                                                        svg.classList.add('IconCamera');
                                                    }}

                                                    src={'/assets/icons/single-neutral-circle.svg'}
                                                />
                                            </div>
                                            {t('button.click-picture')}
                                        </button>
                                        {
                                            this.props.error ?
                                                <div className='vrs-error'>{this.props.error}</div> :
                                                ''
                                        }
                                    </>
                            }
                        </div>
                }
            </>
        );
    }
}

export default withTranslation()(CameraComponent);
