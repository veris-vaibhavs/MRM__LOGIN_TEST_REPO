import {CheckBox, DateTime, Input, Select, Textarea} from "veris-styleguide";
import MeetingWithDropdown from './components/meetingWithDropdown';
import EscortNameDropdown from './components/escortNameDropdown';
import CameraComponent from './components/cameraComponent/CameraComponent';
import ReviewComponent from './components/reviewComponent';
import SignNDA from './components/ndaComponent/signNDA';
import React from "react";
import PhoneComponent from './components/phoneComponent';
export default function RenderField({field,options,context}){
    switch (field.fieldType) {
        case 1:
            return <Input {...field} />;
        case 2:
            return <Textarea {...field} />;
        case 3:
            return <Input {...field} />;
        case 4:
            return <CheckBox {...field} />;
        case 6:
            return <Select  {...field}
                            options={options} />;
        case 7:
            return <Select
                isMulti={true} {...field}
                options={options} />;
        case 8:
            return <Select  {...field}
                            options={options} />;
        case 9:
            return <CameraComponent {...field} />;
        case 10:
            return <DateTime
                timeFormat={false}  {...field} />;
        case 11:
            return <DateTime  {...field} />;
        case 13:
            return <Input
                type='number' {...field} />;
        case 15:
            return <DateTime
                dateFormat={false}  {...field} />;
        case 16:
            return <PhoneComponent {...field} />;
        case 17:
            return <ReviewComponent valueStars='3'
                                    stars='7' {...field} />;
        case 19:
            return <SignNDA
                pdftype={'pdfWithSign'} {...field} />;
        case 26:
            return <SignNDA
                pdftype={'pdfWithoutSign'} {...field} />;
        case 27:
            return <SignNDA
                pdftype={'pdfWithName'} {...field} />;
        case 21:
            return <CameraComponent {...field} />;
        case 22:
            return (
                <>
                    {field.field_code === 'escort_name' ?
                        <>
                            <EscortNameDropdown autofill={context.sameasHost}
                                                venue={context.venue?.value} {...field} />
                            <CheckBox label={('activityDetails.same-as-host')}
                                      value={context.sameasHost}
                                      checked={context.sameasHost}
                                      onClick={(event) => {
                                          this.autofillHost(event, field.id);
                                      }} />
                        </>
                        :
                        <MeetingWithDropdown autofill={context.sameasHost}
                                             venue={context.fields.venue?.value} {...field} />
                    }
                </>
            );
        default:
            return 'IGNORE';
    }

}
