import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  PanResponder,
  Text,
} from 'react-native';
import {
  Crown,
  ArrowLeft,
  Grid,
  RotateCcw,
  Heart,
  X,
} from 'lucide-react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;
const EDGE_PADDING = 20;
const MENU_SIZE = 280;

export default function FloatingMTGNav({ navFunctions = {}, currentLayout = 0 }) {
  // Added a default empty object for navFunctions to prevent undefined errors
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Default position is centered on the center lines
  const defaultX = (WINDOW_WIDTH / 2) - (BUTTON_SIZE / 2);
  const defaultY = (WINDOW_HEIGHT / 2) - (BUTTON_SIZE / 2);

  // Position of the button
  const position = useRef(
    new Animated.ValueXY({
      x: defaultX,
      y: defaultY,
    })
  ).current;

  // Store the current position values for menu placement
  const [buttonPosition, setButtonPosition] = useState({
    x: defaultX,
    y: defaultY
  });

  // Update button position for menu placement
  useEffect(() => {
    const xListener = position.x.addListener(({ value }) => {
      setButtonPosition(prev => ({ ...prev, x: value }));
    });
    
    const yListener = position.y.addListener(({ value }) => {
      setButtonPosition(prev => ({ ...prev, y: value }));
    });
    
    return () => {
      position.x.removeListener(xListener);
      position.y.removeListener(yListener);
    };
  }, []);

  // Menu animations
  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  // Gesture handler for dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => !isMenuOpen, 
    onPanResponderGrant: () => {
      if (isMenuOpen) {
        closeMenu();
      }
    },
    onPanResponderMove: (_, gesture) => {
      if (!isMenuOpen) {
        position.setValue({
          x: Math.max(
            EDGE_PADDING,
            Math.min(WINDOW_WIDTH - BUTTON_SIZE - EDGE_PADDING, gesture.moveX - BUTTON_SIZE / 2)
          ),
          y: Math.max(
            EDGE_PADDING + 50,
            Math.min(WINDOW_HEIGHT - BUTTON_SIZE - EDGE_PADDING, gesture.moveY - BUTTON_SIZE / 2)
          ),
        });
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (!isMenuOpen) {
        // Snap to center lines
        const centerX = WINDOW_WIDTH / 2 - BUTTON_SIZE / 2;
        const centerY = WINDOW_HEIGHT / 2 - BUTTON_SIZE / 2;
        
        // Calculate distances to center lines
        const distToCenterX = Math.abs(gesture.moveX - WINDOW_WIDTH / 2);
        const distToCenterY = Math.abs(gesture.moveY - WINDOW_HEIGHT / 2);
        
        // Snap threshold
        const snapThreshold = 50; // pixels
        
        // Determine target X (snap to center or edge)
        let targetX;
        if (distToCenterX < snapThreshold) {
          targetX = centerX; // Snap to horizontal center line
        } else if (gesture.moveX < WINDOW_WIDTH / 2) {
          targetX = EDGE_PADDING; // Snap to left edge
        } else {
          targetX = WINDOW_WIDTH - BUTTON_SIZE - EDGE_PADDING; // Snap to right edge
        }
        
        // Determine target Y (snap to center or current position)
        let targetY;
        if (distToCenterY < snapThreshold) {
          targetY = centerY; 
        } else {
          // Keep Y position in bounds
          targetY = Math.max(
            EDGE_PADDING + 50,
            Math.min(WINDOW_HEIGHT - BUTTON_SIZE - EDGE_PADDING, gesture.moveY - BUTTON_SIZE / 2)
          );
        }
        
        Animated.spring(position, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6,
          tension: 80,
        }).start();
      }
    },
  });
  
  // Function to center the button
  const centerButton = () => {
    Animated.spring(position, {
      toValue: { 
        x: WINDOW_WIDTH / 2 - BUTTON_SIZE / 2, 
        y: WINDOW_HEIGHT / 2 - BUTTON_SIZE / 2 
      },
      useNativeDriver: false,
      friction: 5,
      tension: 70,
    }).start();
  };

  // Function to open menu
  const openMenu = () => {
    setIsMenuOpen(true);
    
    Animated.parallel([
      Animated.spring(menuScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 50,
      }),
      Animated.timing(menuOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to close menu
  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(menuScale, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 50,
      }),
      Animated.timing(menuOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  };

  // Function to toggle menu
  const toggleMenu = () => {
    if (!isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  // Create safeguarded functions that check if the corresponding navFunction exists
  const safeHandleBack = () => {
    if (typeof navFunctions.handleBack === 'function') {
      navFunctions.handleBack();
    } else {
      console.warn('handleBack function not provided');
    }
  };

  const safeShowLayoutOptions = () => {
    if (typeof navFunctions.showLayoutOptions === 'function') {
      navFunctions.showLayoutOptions();
    } else {
      console.warn('showLayoutOptions function not provided');
    }
  };

  const safeHandleReset = () => {
    if (typeof navFunctions.handleReset === 'function') {
      navFunctions.handleReset();
    } else {
      console.warn('handleReset function not provided');
    }
  };

  const safeHandleCmdrLife = () => {
    if (typeof navFunctions.handleCmdrAndStd === 'function') {
      navFunctions.handleCmdrAndStd();
      
      if (typeof navFunctions.handleSpecialReset === 'function') {
        navFunctions.handleSpecialReset();
      }
    } else {
      console.warn('handleCmdrAndStd function not provided');
    }
  };

  // MenuItem component with label
  const MenuItem = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        closeMenu();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Icon size={26} color="#0F3460" />
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  // Calculate menu position
  const getMenuPosition = () => {
    // Center the menu on the button
    return {
      left: buttonPosition.x - (MENU_SIZE / 2) + (BUTTON_SIZE / 2),
      top: buttonPosition.y - (MENU_SIZE / 2) + (BUTTON_SIZE / 2),
    };
  };

  // Get the life string with fallback
  const lifeStr = navFunctions?.lifeElementsStr || "Life Mode";

  return (
    <>
      {/* Menu overlay (background click to close menu) */}
      {isMenuOpen && (
        <Animated.View style={[styles.menuOverlay, { opacity: menuOpacity }]}>
          <TouchableOpacity style={styles.overlayTouch} onPress={closeMenu} activeOpacity={1} />
        </Animated.View>
      )}

      {/* Draggable floating button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          onPress={toggleMenu} 
          onLongPress={centerButton}
          style={styles.button}
          activeOpacity={0.8}
        >
          {isMenuOpen ? (
            <X size={28} color="#0F3460" />
          ) : (
            <Crown size={28} color="#0F3460" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Menu container */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.menuContainer,
            getMenuPosition(),
            {
              transform: [{ scale: menuScale }],
              opacity: menuOpacity,
            },
          ]}
        >
          <MenuItem 
            icon={ArrowLeft} 
            label="Back" 
            onPress={safeHandleBack} 
          />
          <MenuItem 
            icon={Grid} 
            label="Layouts" 
            onPress={safeShowLayoutOptions} 
          />
          <MenuItem 
            icon={RotateCcw} 
            label="Reset" 
            onPress={safeHandleReset} 
          />
          <MenuItem 
            icon={Heart} 
            label={lifeStr} 
            onPress={safeHandleCmdrLife} 
          />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 52, 96, 0.2)',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  overlayTouch: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: MENU_SIZE,
    height: MENU_SIZE,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuItem: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 52, 96, 0.1)',
    borderRadius: 10,
    padding: 8,
  },
  menuItemText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F3460',
    textAlign: 'center',
  },
});