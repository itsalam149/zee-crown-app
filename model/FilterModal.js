// model/FilterModal.js
import { AntDesign, Entypo } from '@expo/vector-icons';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React from 'react'; // Corrected this line
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { normalizeY } from 'utils/normalize';

const { height } = Dimensions.get('screen');

function FilterModal({ visible, setVisible, onApplySort }) {

  const handleSort = (direction) => {
    onApplySort(direction);
    setVisible(false);
  };

  const handleReset = () => {
    onApplySort(null); // Pass null to clear sorting
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          height: height * 0.6,
        }}
      />
      <View style={styles.container}>
        <View style={styles.filters}>
          <Typo size={25} style={{ fontWeight: '700' }}>
            Sort & Filter
          </Typo>
          <TouchableOpacity style={styles.crossIcon} onPress={() => setVisible(false)}>
            <Entypo name="cross" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Typo size={16} style={styles.heading}>Sort by Price</Typo>
        <TouchableOpacity onPress={() => handleSort('asc')} style={styles.sortButton}>
          <Typo>Price: Low to High</Typo>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('desc')} style={styles.sortButton}>
          <Typo>Price: High to Low</Typo>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.footerButton, { backgroundColor: colors.lighterGray }]}>
            <Typo size={13} style={{ color: colors.black, fontWeight: '600' }}>
              Reset
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopRightRadius: radius._20,
    borderTopLeftRadius: radius._20,
    paddingHorizontal: spacingX._20,
  },
  heading: {
    fontWeight: '700',
    marginTop: spacingY._20,
    marginBottom: spacingY._10,
  },
  crossIcon: {
    backgroundColor: colors.lighterGray,
    borderRadius: radius._20,
    padding: spacingY._5,
    marginTop: spacingY._10,
  },
  sortButton: {
    padding: spacingY._15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lighterGray,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  footerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalizeY(50),
    borderRadius: radius._15,
    borderCurve: 'continuous',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: spacingY._5,
  },
});

export default FilterModal;