import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DefaultButton, IconButton, IButtonStyles, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {  getTheme,  mergeStyleSets, FontWeights, Modal, IIconProps, Stack,  IStackProps,   IStackStyles,
  TextField} from '@fluentui/react';
import axios, { AxiosError } from "axios";
import { formatDate, formatTime, formatStringDate, getDayOfWeek, getWeekNumber} from '../helper/utils';
import calendar from "../../data/calendar.json";
import { visitOutcomeOptions, appointmentTypeOptions } from "../helper/DropDownOptions";
import { IWeekData, IFormattedItem, ISorter, IVisit } from '../interfaces/IVisitReport';

import iconUpIcon from "../../utils/assets/collapse-open.png";
import iconDownIcon from "../../utils/assets/collapse-dow.png";
import alertIcon from "../../utils/assets/alert-icon.png";
import createIcon from "../../utils/assets/create-icon.png";
import deleteIcon from "../../utils/assets/delete-icon.png";
import sendIcon from "../../utils/assets/send-icon.png";
import editIcon from "../../utils/assets/edit-icon.png";
import successIcon from "../../utils/assets/success-icon.png";
import '../../styles/VisitReportView.css'
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { sub } from 'date-fns';

const api = axios.create({
  baseURL: "http://localhost:5002/reports"
})

const color = ["#017dff", "#027fff", "#f5f5f5" ]

const theme = getTheme();
  const contentStyles = mergeStyleSets({
    container: {
      display: 'flex',
      flexFlow: 'column nowrap',
      alignItems: 'stretch',
      width: '60%',
      height: 'auto'
    },
    header: [
      theme.fonts.xLargePlus,
      {
        flex: '1 1 auto',
        borderTop: `2px solid ${theme.palette.themePrimary}`,
        color: theme.palette.neutralPrimary,
        display: 'flex',
        alignItems: 'center',
        fontWeight: FontWeights.semibold,
        padding: '10px 10px 0px 24px',    
      },
    ],
    heading: {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.semibold,
      fontSize: 'inherit',
      margin: '0',
      textAlign: 'center'
    },
    body: {
      flex: '4 4 auto',
      padding: '0 24px 24px 24px',
      overflowY: 'hidden',    
      selectors: {
        p: { margin: '14px 0' },
        'p:first-child': { marginTop: 0 },
        'p:last-child': { marginBottom: 0 },
      },
    },
  });

  const iconButtonStyles: Partial<IButtonStyles> = {
    root: {
      color: 'black', 
      marginLeft: 'auto',
      marginTop: '4px',
      marginRight: '2px',
    },
    rootHovered: {
      color: theme.palette.neutralDark,
    },
  };

  const styles = mergeStyleSets({
    root: { selectors: { '> *': { marginBottom: 15 } } },
    control: { marginBottom: 15 },
  });

    // Note
    const stackStyles: Partial<IStackStyles> = { root:  { width: '100%' } };
    const stackTokens = { childrenGap: 50 };
    const columnProps: Partial<IStackProps> = {
      tokens: { childrenGap: 15 },
      styles: { root: { width: '100%' } },
    };


const formattedData: IWeekData[] = calendar.value.reduce((acc, item) => {
  const dateStart = new Date(item.start.dateTime);
  const dateEnd = new Date(item.end.dateTime);
  const year = dateStart.getFullYear();
  const week = getWeekNumber(dateStart);
  const dayOfWeek = getDayOfWeek(dateStart);

  //check the week corresponding in to acc
  let weekData = acc.find((data) => data.weekNumber === `${week}/${year}`);

  if (!weekData) {
    // If the week does not exist, we create it with a random ID
    weekData = {
      weekNumber: `${week}/${year}`,
      totalVisited: 0,
      visitReportCreated: 0,
      withoutVisitReport: 0,
      weekend: [],
    };
    acc.push(weekData);
  };

  //check the week corresponding
  let dayData = weekData.weekend.find((day) => day.dayOfVisit === `${dayOfWeek}, ${formatDate(dateStart)}`);
  if (!dayData) {
    // If the day does not exist, we create it with a random ID and the current number of visits
    dayData = {
      dayOfVisit: `${dayOfWeek}, ${formatDate(dateStart)}`,
      totalDayVisited: 0,
      visitDayReportCreated: 0,
      withoutVisitReport: 0,
      days: [],
      isCompleted: false
    };
    weekData.weekend.push(dayData);
  }

   // Formatting the item and adding it into  array
   const formattedItem: IFormattedItem = {
    userId: item.organizer.emailAddress.address,
    name: item.organizer.emailAddress.name,
    appointmentId: item.id,
    dayOfVisit:item.start.dateTime,
    dateStart: formatTime(dateStart),
    dateEnd: formatTime(dateEnd),
    busines: item.location.displayName,
    street: item.location.address.street,
    city: item.location.address.city,
    countryOrRegion: item.location.address.countryOrRegion,
    postCode: item.location.address.postalCode,
    isCompleted: dayData.isCompleted
  };

  dayData.days.push(formattedItem);
  dayData.totalDayVisited = dayData.days.length;
  dayData.withoutVisitReport = dayData.totalDayVisited - dayData.visitDayReportCreated

  // Number visited Week
  weekData.totalVisited = weekData.weekend.reduce((acc, { days }) => acc + days.length, 0);

  weekData.withoutVisitReport = weekData.totalVisited - weekData.visitReportCreated

  return acc;
}, [] as IWeekData[]);

const formattedDataWithRandomId = formattedData.map((item) => {
  const weekItemIdMapping = item.id ? item : {
      ...item, id: Math.floor(Math.random() * Date.now()) 
    };

  const subItemIdMapping = item.weekend.map((weekItem) => {
    const dayItemIdMapping = weekItem.days.map((dayItem) =>
    dayItem.id ? dayItem : { ...dayItem, id: Math.floor(Math.random() * Date.now()) }
    );

    const subItemIdMappingResult = weekItem.id ? weekItem 
    : { ...weekItem, id: Math.floor(Math.random() * Date.now())};

    return { ...subItemIdMappingResult, days: dayItemIdMapping };

  });

  return { ...weekItemIdMapping, weekend: subItemIdMapping };
});

console.log("finalData", formattedDataWithRandomId);

const sortWeekDateNumberDescending = [...formattedDataWithRandomId].sort((a, b) => {
  const month1 = a.weekNumber.split("/")[0];
  const year1 = a.weekNumber.split("/")[1];
  const month2 = b.weekNumber.split("/")[0];
  const year2 = b.weekNumber.split("/")[1];
  return year1 > year2 || month1 > month2 ? -1 : 1;
});

const sorter: ISorter = {
  // "sunday": 0, // << if sunday is first day of week
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
}

const sortDataByDay = sortWeekDateNumberDescending.map(function sortByDay(object){
  object.weekend.sort((a, b) => {
    let day1 = a.dayOfVisit.split(", ")[0].toLowerCase();
    let day2 = b.dayOfVisit.split(", ")[0].toLowerCase();
    return sorter[day1] - sorter[day2]
  })
  return object
})

sortDataByDay.map(function sortByTimeHour(object) {
  object.weekend.map((day) => {
    day.days.sort((a, b) => {
      const hourA = a.dateStart.split(":")[0];
      const minA = a.dateStart.split(":")[1];
      const hourB = b.dateStart.split(":")[0];
      const minB = b.dateStart.split(":")[1];
      return hourA < hourB || minA < minB ? -1 : 1;
    });
  });
});


const VisitReportView = () => {
  const { t }: { t: TFunction } = useTranslation();

  const [dataSource, setDataSource] = useState(sortDataByDay)
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [userId, setUserId] = useState<string>("Maxim_Kemajou@n77r.onmicrosoft.com");
  const [appointmentId, setAppointmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [partner, setPartner] = useState<string>("");
  const [outcomeSelected, setOutcomeSelected] = useState< string | number | undefined >();
  const [appointmentTypeSelected, setAppointmentTypeSelected] = useState< string | number | undefined >();
  const [appointmentDate, setAppointmentDate] = useState();
  const [dateOfVisit, setDateOfVisit] = useState<string>("");
  const [visitTime, setVisitTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const LENGTH_NOTE_TEXTAREA = 5

  

  const [isExpanded, setIsExpanded] = useState< Record<number | string, boolean>>({});
  const cancelIcon: IIconProps = { iconName: "Cancel" };

  const [openModal, setOpenModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState("");


  // Edit Modal Variables
  const [currentVisit, setCurrentVisit] = useState<IVisit>();
  const [editUserId, setEditUserId] = useState(userId)
  const [editAppointmentId, setEditAppointmentId] = useState<string | undefined>(appointmentId)
  const [editSubject, setEditSubject] = useState<string | undefined>(currentVisit?.subject)
console.log("editSubject", editSubject)

  const [editPartner, setEditPartner] = useState<string | undefined>(currentVisit?.partner);
  const [editOutcomeSelected, setEditOutcomeSelected] = useState< string | number | undefined >(currentVisit?.outcome);
  const [editAppointmentTypeSelected, setEditAppointmentTypeSelected] = useState< string | number | undefined >(currentVisit?.visitType);
  const [editNote, setEditNote] = useState<string | undefined>(currentVisit?.note);
  const [selectedEditVisit, setSelectedEditVisit] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);

  const [countVisitWeek, setCountVisitWeek] = useState<number>(0);
  const [countVisitDay, setCountVisitDay] = useState<number>(1);



  useEffect(()=>{
    initializeIcons();

    const fetchVisits = async () => {
      try {
        await api.get('/').then((response) => {
          setVisits(response.data);
        });
      } catch (error) {
        const errors = error as Error | AxiosError;
        console.log(error);
        console.log(errors.message);
      }
    };

    fetchVisits();
  },[]);

  // Modal Create Visit
  const handleOpenModal = (id: string) => {
    setSelectedVisit(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false)
  }


  // Subject
  const handleChangeSubject = React.useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      setSubject(value! || '');
    },
    [],
  );

  // Partner
  const handleChangePartner = React.useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      setPartner(value! || '');
    },
    [],
  );

  // Outcome
  const onChangeOutcome = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void => {
      setOutcomeSelected(option?.key);
    },
    [setOutcomeSelected],
  );

  // Appointment Type 
  const onChangeAppointmentType = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void => {
      setAppointmentTypeSelected(option?.key);
    },
    [setAppointmentTypeSelected],
  );

  // Appointment Date
  const onChangeAppointmentDate = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement >, value?: string ) => {
      setDateOfVisit(value!)
    },
    [],
  );

  // Time
  const onChangeVisitTime = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement >, value?: string ) => {
      setVisitTime(value!)
    },
    [],
  );

  // Note
  const onChangeNoteTextArea = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    if (!newValue || newValue.length <= LENGTH_NOTE_TEXTAREA) {
      setNote(newValue || '');
    }
  },
  [],
)


// Modal Edit Visit

const handleEditOpenModal = (id: string | undefined) => {
  setSelectedEditVisit(id!);
  setOpenEditModal(true);
  setEditSubject(currentVisit?.subject)
};

const handleEditCloseModal = () => {
  setOpenEditModal(false)
}

// Edit Subject
const handleEditChangeSubject = React.useCallback(
  (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    setEditSubject(value! || '');
  },
  [],
);

// Edit Partner
const handleEditChangePartner = React.useCallback(
  (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    setEditPartner(value! || '');
  },
  [],
);

// Edit Outcome
const onChangeEditOutcome = useCallback(
  (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void => {
    setEditOutcomeSelected(option?.key);
  },
  [setEditOutcomeSelected],
); 

// Edit Appointment Type
const onChangeEditAppointmentType = useCallback(
  (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void => {
    setEditAppointmentTypeSelected(option?.key);
  },
  [setEditAppointmentTypeSelected],
);
 

// Edit Appointment  Date
const onChangeEditAppointmentDate = useCallback(
  (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement >, value?: string ) => {
    setDateOfVisit(value!)
  },
  [],
);

// Edit Time
const onChangeEditVisitTime = useCallback(
  (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement >, value?: string ) => {
    setVisitTime(value!)
  },
  [],
);

// Edit Note
const onChangeEditNoteTextArea = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    if (!value || value.length <= LENGTH_NOTE_TEXTAREA) {
      setEditNote(value! || '');
    }
  },
[],
)

  const editCurentVisit = (visit :IVisit) => {
    setCurrentVisit({
      id: visit.id,
      userId: visit.userId,
      appointmentId: visit.appointmentId,
      subject: visit.subject,
      partner: visit.partner,
      outcome: visit.outcome,
      visitType: visit.visitType,
      appointmentDate: visit.appointmentDate,
      note: visit.note,
      visitTime:visit.visitTime
    });
  };

  // axios CRUD

  const cleanFormCreate = () => {
    setAppointmentId("");
    setSubject("");
    setPartner("");
    setVisitTime("");
    setAppointmentTypeSelected("");
    setNote("");
    setOutcomeSelected("");
    setDateOfVisit("");
  };


  const postVisitReport = async () => {
    const newVisit: IVisit = {
      userId: userId,
      appointmentId: appointmentId,
      subject: subject,
      partner: partner,
      outcome: outcomeSelected,
      visitType: appointmentTypeSelected,
      appointmentDate: dateOfVisit,
      visitTime: visitTime,
      note: note,
    };

    try {
      const response = await api.post("/", newVisit);
      const allVisits = [...visits, response.data];
      
      setVisits(allVisits);

      cleanFormCreate()
      setOpenModal(false);

      // alert("Request was successful added");
    } catch (error) {
      console.log("Error Post", error)
    }
  };


const updateVisit = async (id: string) => {

  const updatedVisit: IVisit = {
    userId: editUserId,
    appointmentId: editAppointmentId,
    subject: editSubject,
    partner: editPartner,
    outcome: editOutcomeSelected,
    visitType: editAppointmentTypeSelected,
    appointmentDate: dateOfVisit,
    visitTime: visitTime,
    note: editNote,
    id: id
  };


  try {
    api.put(`/${id}`, updatedVisit).then(response => {

       setVisits(visits.map((visit : IVisit) => visit.id === id ?  updatedVisit : visit));
      handleEditCloseModal();
    })
  } catch (error) {
    const errors = error as Error | AxiosError;
        console.log(error);
        console.log(errors.message);
  }
};

const deleteVisit = async (id: string) => {
  try {
      await api.delete(`/${id}`).then(() => {
        setVisits(visits.filter((visit : IVisit) => {
          return visit.id !== id;
        }))
    }).then(() => {
      console.log("visit was successfully deleted");
    }); 
    } catch (error) {
      console.log(`Error: ${error}`);
  }
};


  const day = 'Monday, 28.08.2023';

  const dayFormated = day.slice(8, day.length);
  //console.log("dayFormated", dayFormated);



  let arr =[]
  const dateCheck = "2023-08-28T07:45:00.0000000"
  const dateCheckFormated = dateCheck.slice(0, 10).split('-').reverse().join('.');

  //console.log("dateCheckFormated", dateCheckFormated);


  //dateCheck.slice(0, 10).split('-').reverse().join('-')
  const elemtFind = visits?.filter((visit : IVisit) => visit.appointmentDate.slice(0, 10).split('-').reverse().join('.') === dayFormated )
  //console.log("Find2", elemtFind.length);



function getValue(value: any){
  visits?.find((visit : IVisit) => visit.appointmentId === value)
}




 return (
  <>
    <div className='titel'>
      <h1>{t("visitReport.header") as string}</h1>
    </div>

    <div className='container-content'>
      {dataSource && dataSource.map((item, index) => {
        const { id, weekend,  totalVisited, visitReportCreated, withoutVisitReport } = item;
        const findAppointmentId = item.weekend.map((day, index) => {
          day.days.map((obj, index) => {obj.appointmentId})
        })

        return (
          <div key={index}>
            <div className="content-principal">
              <div className="rows">
                <div className="row-content">
                  <div className="icon-item">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsExpanded((prev) => ({
                          ...prev,
                          [item.id!]: !prev[item.id!],
                        }));
                      }}
                    >
                      {isExpanded[item.id!] ? (
                        <img src={iconDownIcon} /> ) : ( <img src={iconUpIcon} /> )}
                    </span>
                    <span style={{ margin: "0 0.7rem 0 0px" }}>
                      {item.withoutVisitReport &&
                      item.withoutVisitReport > 0 ? (
                        <img src={alertIcon} /> ) : ("")}
                    </span>
                    <h2>{`${item.weekNumber}: ${item.totalVisited} ${t("visitReport.visit") as string}`}</h2>
                  </div>

                  <div className="notVisited">
                    <h3> {`${item.withoutVisitReport}`} {t("visitReport.withoutVisitReport") as string} </h3> 
                  </div>

                </div>
              </div>
              {isExpanded[item.id!] &&
                item.weekend?.map((subItem, index) => {
                  const {id, dayOfVisit, totalDayVisited, visitDayReportCreated, withoutVisitReport,isCompleted } = subItem
                  const dayOfVisitFormated = dayOfVisit.slice(8, dayOfVisit.length).split('-').reverse().join('.');
                  console.log("dayOfVisit", dayOfVisitFormated)
                  // const dayOfVisitFormated2 ="29.12.2023"

                  const filterDayOfVisit = visits?.filter((visit : IVisit) => visit.appointmentDate.slice(0, 10).split('-').reverse().join('.') === dayOfVisitFormated )

                  // console.log("fil", filterDayOfVisit.length);
                  const findMatchDate = filterDayOfVisit && filterDayOfVisit.find((items : IVisit) => items.appointmentDate === "29.12.2023");


                  return (
                  <div className="children" key={index}>
                    <div className="row-subItems-titel">
                      {
                        filterDayOfVisit && filterDayOfVisit.length === 0  ?
                        <span style={{ margin: "3px 5px 0 0" }}>
                          <img src={alertIcon} />
                        </span>
                       :
                       null

                       }

                      <h2>
                        {subItem.dayOfVisit} : {" "}
                        {`${subItem.totalDayVisited} visit(s)`}
                      </h2>
                    </div>

                    <div className="countNoVisit">
                      <div className="report-no-visited">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setIsExpanded((prev) => ({
                              ...prev,
                              [subItem.id!]: !prev[subItem.id!],
                            }));
                          }}
                        >
                          {isExpanded[subItem.id!] ? (<img src={iconDownIcon} /> ) : (<img src={iconUpIcon} />
                          )}
                        </span>
                      </div>
                      <div className="visit-count">

                      { dayOfVisitFormated  ? 
                        <h4> {`${subItem.totalDayVisited - filterDayOfVisit.length} `} {t("visitReport.withoutVisitReport") as string} </h4>

                        : <h4> {`${subItem.totalDayVisited}`} {t("visitReport.withoutVisitReport") as string} </h4>

                      }


                        <h4> {subItem.withoutVisitReport}/ {subItem.totalDayVisited}</h4>
                      </div>
                    </div>

                    <hr style={{marginTop: 2, border:"1px solid #017fff"}}/>


                    {isExpanded[subItem.id!] &&
                      subItem.days?.map((day, index) => {
                        const findPostAppointmentId = day && visits.find((visit : IVisit) => visit.appointmentId === day.appointmentId);

                        return (
                          <>
                          <div key={index} className="report-details">

                            <div className="left-items">

                              <div className="visit-success">
                                 { 
                                    day.appointmentId === findPostAppointmentId?.appointmentId ? 
                                    <span> <img src={successIcon}/> </span>
                                    : null
                                 } 
                              </div>

                              <div>
                                <div style={{ margin: "0 0 25px 5px" }}>
                                  <h4>{day.dateStart} - {day.dateEnd} : {day.busines} </h4>
                                </div>

                                <div>
                                  <h4>{day.street}</h4>
                                  <h4 style={{ marginBottom: "5px" }}> {day.countryOrRegion} - {day.postCode}</h4>
                                </div>
                              </div>

                            </div>

                            <div className="center-items">
                              {
                                  visits && visits.map((visit: IVisit, key: number) => {
                                    const { userId, outcome, appointmentId, id } = visit;
                                    return (

                                      <>
                                          <div>
                                            {
                                            appointmentId === day.appointmentId ? (
                                              <>
                                                <div style={{ display: "flex" }}>
                                                  <div>
                                                    <h4>{t("visitReport.visitReport") as string} : {userId}</h4>
                                                    <h4>{outcome}</h4>
                                                    <h4>{day.dateStart} - {day.dateEnd}</h4>
                                                  </div>


                                                  <span
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { deleteVisit(id!)}}
                                                  >
                                                    <img src={deleteIcon} />
                                                  </span>
                                                  <span
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                      handleEditOpenModal(visit.appointmentId);
                                                       setEditAppointmentId(appointmentId);
                                                       editCurentVisit(visit);
                                                       setCurrentVisit(visit)
                                                    }}
                                                  >
                                                    <img src={editIcon} />
                                                  </span>

                                                </div>
                                              </>
                                            ) : null
                                            }
                                          </div>

                                      </>
                                    );
                                  })
                              }
                            </div>

                            <div className="right-items">

                              <div className="icon-action">

                              { 
                                day.appointmentId === findPostAppointmentId?.appointmentId ? 
                                <>
                                    <div></div>
                                </>
                                : <span
                                    onClick={() => {
                                      handleOpenModal(day.appointmentId);
                                      setAppointmentId(day.appointmentId);
                                      setDateOfVisit(formatStringDate(new Date(day.dayOfVisit)));
                                      setVisitTime(day.dateStart);
                                    }}
                                  >
                                    <img src={createIcon} />
                                  </span>
                              }
                              </div>

                            </div>
                          </div>
                          <hr style={{ marginTop: 2, border: "1px solid #027fff" }} />
                        </>
                          );
                        }
                    )}

                  </div>
                  );
                  })

                }


                {/* Edit Apoitment */}
                  <Modal
                    isOpen={openEditModal}
                    isBlocking={false}
                    containerClassName={contentStyles.container}
                    >
                    <div className={contentStyles.header}>
                      <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={handleEditCloseModal}
                      />
                    </div>
                    <div className={contentStyles.body}>
                      <h2
                        className="modal-title"
                        style={{ fontWeight: "700", margin: 0 }}
                      >
                        {t("visitReport.editVisit") as string}
                      </h2>
                      <div className={styles.root}>
                        <TextField
                          label={t("visitReport.subjectLbl") as string}
                          defaultValue={currentVisit?.subject}
                          onChange={handleEditChangeSubject}
                        />
                        <TextField
                          label={t("visitReport.partnerLbl") as string}
                          defaultValue={currentVisit?.partner}
                          onChange={handleEditChangePartner}
                          // onChange={(
                          //   event: React.FormEvent<
                          //     HTMLInputElement | HTMLTextAreaElement
                          //   >,
                          //   value?: string
                          // ) => setEditPartner(value!)}
                        />

                        <Dropdown
                          placeholder={t("visitReport.dropdownOptionOutcome.placeholder") as string}
                          label={t("visitReport.outcomeLbl") as string}
                          options={visitOutcomeOptions}
                          defaultSelectedKey={currentVisit?.outcome}
                          onChange={onChangeEditOutcome}
                        />

                        <Dropdown
                          placeholder={t("visitReport.dropdownAppointmentType.placeholder") as string}
                          label={t("visitReport.appointmentTypeLbl") as string}
                          options={appointmentTypeOptions}
                          defaultSelectedKey={currentVisit?.visitType}
                          onChange={onChangeEditAppointmentType}
                        />

                        <TextField
                          label={t("visitReport.dateLbl") as string}
                          disabled
                          defaultValue={currentVisit?.appointmentDate}
                          onChange={onChangeEditAppointmentDate}

                          // onChange={(
                          //   event: React.FormEvent<
                          //     HTMLInputElement | HTMLTextAreaElement
                          //   >,
                          //   value?: string
                          // ) => setDateOfVisit(value!)}
                        />
                        <TextField
                          label={t("visitReport.timeLbl") as string}
                          disabled
                           defaultValue={currentVisit?.visitTime}
                           onChange={onChangeEditVisitTime}
                          // onChange={(
                          //   event: React.FormEvent<
                          //     HTMLInputElement | HTMLTextAreaElement
                          //   >,
                          //   value?: string
                          // ) => setVisitTime(value!)}
                        />
                        <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                          <Stack {...columnProps}>
                            <TextField
                              label={t("visitReport.noteLbl") as string}
                              multiline
                              rows={5}
                              resizable={false}
                              defaultValue={currentVisit?.note}
                              onChange={onChangeEditNoteTextArea}
                              // onChange={( event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,  value?: string) => {
                              //     if (!value || value.length <= LENGTH_NOTE_TEXTAREA) {
                              //           setEditNote(value || '')}
                              //       }
                                    
                              //     }
                            />
                          </Stack>
                        </Stack>
                      </div>

                      <div className="action-modal">
                        <DefaultButton
                          onClick={handleEditCloseModal}
                          text={t("visitReport.btnModalCancel") as string}
                        />
                        <PrimaryButton
                          onClick={() => updateVisit(currentVisit?.id!)}
                          text={t("visitReport.btnModalSave") as string}
                        />
                      </div>
                    </div>
                  </Modal>

                  {
                  // Create new Appointment Report
                    <Modal
                        isOpen={openModal}
                        isBlocking={false}
                        containerClassName={contentStyles.container}
                        isDarkOverlay={true} 
                        >
                        <div className={contentStyles.header}>
                          <IconButton
                            styles={iconButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={handleCloseModal}
                          />
                        </div>
                        <div className={contentStyles.body}>
                          <h2
                            className="modal-title"
                            style={{ fontWeight: "700", margin: 0 }}
                          >
                            {t("visitReport.createVisitReport") as string}
                          </h2>
                          <div className={styles.root}>
                            <TextField
                              label={t("visitReport.subjectLbl") as string}
                              onChange={handleChangeSubject}
                              // onChange={(
                              //   event: React.FormEvent<
                              //     HTMLInputElement | HTMLTextAreaElement
                              //   >,
                              //   value?: string
                              // ) => setSubject(value!)}
                            />
                            <TextField
                              label={t("visitReport.partnerLbl") as string}
                              onChange={handleChangePartner}
                              // onChange={(
                              //   event: React.FormEvent<
                              //     HTMLInputElement | HTMLTextAreaElement
                              //   >,
                              //   value?: string
                              // ) => setPartner(value!)}
                            />

                            <Dropdown
                              placeholder={t("visitReport.dropdownOptionOutcome.placeholder") as string}
                              label={t("visitReport.outcomeLbl") as string}
                              options={visitOutcomeOptions}
                              selectedKey={outcomeSelected}
                              onChange={onChangeOutcome}
                            />

                            <Dropdown
                              placeholder={t("visitReport.dropdownAppointmentType.placeholder") as string}
                              label={t("visitReport.appointmentTypeLbl") as string}
                              options={appointmentTypeOptions}
                              onChange={onChangeAppointmentType}
                            />

                            <TextField
                              label={t("visitReport.dateLbl") as string}
                              disabled
                              value={dateOfVisit}
                              onChange={onChangeAppointmentDate}
                              // onChange={(
                              //   event: React.FormEvent<
                              //     HTMLInputElement | HTMLTextAreaElement
                              //   >,
                              //   value?: string
                              // ) => setDateOfVisit(value!)}
                            />
                            <TextField
                              label={t("visitReport.timeLbl") as string}
                              disabled
                              value={visitTime}
                              onChange={onChangeVisitTime}
                              // onChange={(
                              //   event: React.FormEvent<
                              //     HTMLInputElement | HTMLTextAreaElement
                              //   >,
                              //   value?: string
                              // ) => setVisitTime(value!)}
                            />
                            <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                              <Stack {...columnProps}>
                                <TextField
                                  label={t("visitReport.noteLbl") as string}
                                  multiline
                                  rows={5}
                                  resizable={false}
                                  value={note}
                                  onChange={onChangeNoteTextArea}
                                />
                              </Stack>
                            </Stack>
                          </div>

                          <div className="action-modal">
                            <DefaultButton
                              onClick={handleCloseModal}
                              text={t("visitReport.btnModalCancel") as string}
                            />
                            <PrimaryButton
                              onClick={postVisitReport}
                              text={t("visitReport.btnModalSave") as string}
                            />
                          </div>
                        </div>
                    </Modal>
                  }

            </div>
          </div>
        );
      })} 
    </div>


   </>
  )
}

export default VisitReportView;