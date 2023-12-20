package com.campusdual.model.core.service;

import com.campusdual.api.core.service.IAnnounceService;
import com.campusdual.model.core.dao.AgreementDao;
import com.campusdual.model.core.dao.AnnounceDao;
import com.campusdual.model.core.dao.UserDao;
import com.campusdual.model.core.utils.CalculateDistances;
import com.ontimize.jee.common.dto.EntityResult;
import com.ontimize.jee.common.dto.EntityResultMapImpl;
import com.ontimize.jee.common.exceptions.OntimizeJEERuntimeException;
import com.ontimize.jee.server.dao.DefaultOntimizeDaoHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Lazy
@Service("AnnounceService")
public class AnnounceService implements IAnnounceService {

    @Autowired
    private AnnounceDao announceDao;
    @Autowired
    private AgreementDao agreementDao;
    @Autowired
    private DefaultOntimizeDaoHelper daoHelper;
    @Autowired
    private UserService userService;


    public EntityResult announceQuery(Map<?, ?> keyMap, List<?> attrList) throws OntimizeJEERuntimeException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userKeyMap = new HashMap<>((Map<String, Object>) keyMap);
        userKeyMap.put("USER_",authentication.getName());
        return this.daoHelper.query(announceDao, userKeyMap, attrList);
    }
    public EntityResult agreementsConversationsAnnouncesQuery(Map<?, ?> keyMap, List<?> attrList) throws OntimizeJEERuntimeException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userKeyMap = new HashMap<>((Map<String, Object>) keyMap);
        userKeyMap.put("USER_",authentication.getName());
        return this.daoHelper.query(announceDao, userKeyMap, attrList, "agreementsConversationsAnnounces");
    }

    public EntityResult agreementsConversationsUserAnnouncesQuery(Map<?, ?> keyMap, List<?> attrList) throws OntimizeJEERuntimeException {
        return this.daoHelper.query(announceDao, keyMap, attrList, "agreementsConversationsUserAnnounces");
    }

    public EntityResult announceAllQuery(Map<?, ?> keyMap, List<?> attrList) throws OntimizeJEERuntimeException {
        CalculateDistances calculateDistances= new CalculateDistances();
        List<String> userLocation = new ArrayList<>();
        userLocation.add(UserDao.LONGITUDE);
        userLocation.add(UserDao.LATITUDE);
        EntityResult queryUserLocation = userService.userLocationQuery(userLocation);
        Map<String,BigDecimal> userAuthenticated = queryUserLocation.getRecordValues(0);
        BigDecimal userLongitude = userAuthenticated.get(UserDao.LONGITUDE);
        BigDecimal userLatitude = userAuthenticated.get(UserDao.LATITUDE);
        EntityResult queryAllResult = this.daoHelper.query(announceDao, keyMap, attrList, "allDetailAnnounces");
        EntityResult toret = new EntityResultMapImpl();
        if (queryAllResult.getCode() == EntityResult.OPERATION_SUCCESSFUL) {
            ArrayList<Double> listDistance = new ArrayList<>();
            List<Map<String,Object>> records = new ArrayList<>();
            for (int i = 0; i < queryAllResult.calculateRecordNumber(); i++) {
                Map<String,Object> record = queryAllResult.getRecordValues(i);

                double distanceCalculated = calculateDistances.calculateDistance(userLatitude.doubleValue(), userLongitude.doubleValue(), (double) queryAllResult.getRecordValues(i).get(AnnounceDao.ALATITUDE), (double) queryAllResult.getRecordValues(i).get(AnnounceDao.ALONGITUDE));
                record.put("DISTANCE", distanceCalculated);
                records.add(record);
                //listDistance.add(distanceCalculated);
            }
            //queryAllResult.put("DISTANCE", listDistance);
            List<Map<String,Object>> sortedRecords = records.stream().sorted((r1,r2) -> {
                Double d1 = (Double) r1.get("DISTANCE");
                Double d2 = (Double) r2.get("DISTANCE");
                return d2.compareTo(d1);
            }).collect(Collectors.toList());
            for (Map<String,Object> r: sortedRecords) {
                toret.addRecord(r);
            }
            /*ArrayList<Double> listSorted = listDistance.stream().sorted().collect(Collectors.toCollection(ArrayList::new));
            Collections.reverse(listSorted);
            for (Double d : listSorted) {
                int index = listDistance.indexOf(d);
                toret.addRecord(queryAllResult.getRecordValues(index));
            }
            */
        }
        return toret;
    }

    public EntityResult announceInsert(Map<?, ?> attrMap) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userKeyMap = new HashMap<>((Map<String, Object>) attrMap);
        userKeyMap.put("USER_",authentication.getName());
        Object objStart = userKeyMap.remove("A_START_HOUR");
        Object objFinish = userKeyMap.remove("A_FINISH_HOUR");
        String HHmmssStart = objStart.toString().substring(11,19);
        String HHmmssFinish = objFinish.toString().substring(11,19);
        userKeyMap.put("A_START_HOUR",HHmmssStart);
        userKeyMap.put("A_FINISH_HOUR",HHmmssFinish);
        return this.daoHelper.insert(announceDao, userKeyMap);
    }

    public EntityResult announceUpdate(Map<?, ?> attrMap, Map<?, ?> keyMap) {
        Map<String, Object> userKeyMap = new HashMap<>((Map<String, Object>) attrMap);
        if (attrMap.containsKey("A_START_HOUR")){
            Object objStart = attrMap.remove("A_START_HOUR");
            String HHmmssStart = objStart.toString().substring(11,19);
            userKeyMap.put("A_START_HOUR",HHmmssStart);
        }
        if (attrMap.containsKey("A_FINISH_HOUR")){
            Object objFinish = userKeyMap.remove("A_FINISH_HOUR");
            String HHmmssFinish = objFinish.toString().substring(11,19);
            userKeyMap.put("A_FINISH_HOUR",HHmmssFinish);}
        return this.daoHelper.update(announceDao, userKeyMap, keyMap);
    }

    public EntityResult announceDelete(Map<?, ?> keyMap) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userKeyMap = new HashMap<>((Map<String, Object>) keyMap);
        userKeyMap.put("USER_",authentication.getName());
        return this.daoHelper.delete(this.announceDao, userKeyMap);
    }
}
